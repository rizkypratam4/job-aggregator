<?php

namespace App\Services\Gmail;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class GmailService
{
    private const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
    private const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

    /**
     * Ambil pesan terbaru dari inbox Gmail user.
     *
     * @return Collection<int, array{
     *     gmail_message_id: string,
     *     sender_email: string,
     *     sender_domain: string,
     *     subject: string,
     *     snippet: string,
     *     received_at: \Illuminate\Support\Carbon,
     * }>
     */
    public function fetchLatestMessages(User $user, int $maxResults = 20): Collection
    {
        $accessToken = $this->ensureValidAccessToken($user);

        if (! $accessToken) {
            Log::error('GmailService: tidak ada access_token valid untuk user.', ['user_id' => $user->id]);

            return collect();
        }

        $messageIds = $this->listMessageIds($accessToken, $maxResults);

        if ($messageIds->isEmpty()) {
            return collect();
        }

        return $messageIds
            ->map(fn(string $id) => $this->fetchMessageDetail($accessToken, $id))
            ->filter()
            ->values();
    }

    // Ambil daftar ID pesan terbaru di inbox.
    private function listMessageIds(string $accessToken, int $maxResults): Collection
    {
        try {
            $response = Http::withToken($accessToken)
                ->retry(2, 500)
                ->get(self::GMAIL_API_BASE . '/messages', [
                    'maxResults' => $maxResults,
                    'labelIds' => 'INBOX',
                ]);
        } catch (Exception $e) {
            Log::error('GmailService: gagal fetch daftar pesan.', ['error' => $e->getMessage()]);

            return collect();
        }

        if ($response->failed()) {
            Log::error('GmailService: response gagal saat list messages.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return collect();
        }

        return collect($response->json('messages', []))
            ->pluck('id')
            ->filter();
    }

    /**
     * Ambil detail pesan (From, Subject, snippet, dan tanggal).
     * Gunakan metadata agar response tetap ringan.
     */
    private function fetchMessageDetail(string $accessToken, string $messageId): ?array
    {
        try {
            $response = Http::withToken($accessToken)
                ->retry(2, 500)
                ->get(self::GMAIL_API_BASE . "/messages/{$messageId}", [
                    'format' => 'metadata',
                    'metadataHeaders' => ['From', 'Subject'],
                ]);
        } catch (Exception $e) {
            Log::error('GmailService: gagal fetch detail pesan.', [
                'message_id' => $messageId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }

        if ($response->failed()) {
            Log::error('GmailService: response gagal saat fetch detail pesan.', [
                'message_id' => $messageId,
                'status' => $response->status(),
            ]);

            return null;
        }

        $data = $response->json();
        $headers = collect($data['payload']['headers'] ?? []);

        $fromHeader = $headers->firstWhere('name', 'From')['value'] ?? '';
        $subject = $headers->firstWhere('name', 'Subject')['value'] ?? '(Tanpa subjek)';

        [$senderEmail, $senderDomain] = $this->parseSenderEmail($fromHeader);

        $receivedAt = isset($data['internalDate'])
            ? now()->createFromTimestampMs((int) $data['internalDate'])
            : now();

        return [
            'gmail_message_id' => $data['id'],
            'sender_email' => $senderEmail,
            'sender_domain' => $senderDomain,
            'subject' => $subject,
            'snippet' => $data['snippet'] ?? '',
            'received_at' => $receivedAt,
        ];
    }

    // Parse header From menjadi email dan domain.
    private function parseSenderEmail(string $fromHeader): array
    {
        if (preg_match('/<(.+?)>/', $fromHeader, $matches)) {
            $email = $matches[1];
        } else {
            $email = trim($fromHeader);
        }

        $email = strtolower($email);
        $domain = str_contains($email, '@') ? substr(strrchr($email, '@'), 1) : '';

        return [$email, $domain];
    }

    // Validasi access_token dan refresh jika expired.
    private function ensureValidAccessToken(User $user): ?string
    {
        $isExpiringSoon = ! $user->gmail_token_expires_at
            || $user->gmail_token_expires_at->subMinutes(5)->isPast();

        if (! $isExpiringSoon) {
            return $user->gmail_access_token;
        }

        if (! $user->gmail_refresh_token) {
            Log::error('GmailService: token expired tapi tidak ada refresh_token.', ['user_id' => $user->id]);

            return null;
        }

        try {
            $response = Http::asForm()
                ->retry(2, 500)
                ->post(self::TOKEN_ENDPOINT, [
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'refresh_token' => $user->gmail_refresh_token,
                    'grant_type' => 'refresh_token',
                ]);
        } catch (Exception $e) {
            Log::error('GmailService: gagal refresh token.', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }

        if ($response->failed()) {
            Log::error('GmailService: response gagal saat refresh token.', [
                'user_id' => $user->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        }

        $data = $response->json();

        $user->update([
            'gmail_access_token' => $data['access_token'],
            'gmail_token_expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
        ]);

        return $data['access_token'];
    }
}
