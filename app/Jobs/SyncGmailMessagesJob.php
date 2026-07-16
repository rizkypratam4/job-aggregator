<?php

namespace App\Jobs;

use App\Models\EmailMessage;
use App\Models\User;
use App\Services\Gmail\GmailService;
use App\Support\EmailClassifier;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class SyncGmailMessagesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        private readonly User $user,
        private readonly int $maxResults = 50,
    ) {}

    public function handle(GmailService $gmailService, EmailClassifier $classifier): int
    {
        $messages = $gmailService->fetchLatestMessages($this->user, $this->maxResults);

        if ($messages->isEmpty()) {
            Log::info('SyncGmailMessagesJob: tidak ada pesan baru diambil.', ['user_id' => $this->user->id]);

            return 0;
        }

        $botDomains = collect(config('job-boards.bot_domains', []));

        $savedCount = 0;
        $skippedBotCount = 0;
        $skippedNoStatusCount = 0;

        foreach ($messages as $data) {
            $isBotNotification = $botDomains->contains(
                fn(string $domain) => Str::endsWith($data['sender_domain'], $domain)
            );

            if ($isBotNotification) {
                $skippedBotCount++;

                continue;
            }

            $detectedStatus = $classifier->classify($data['subject'], $data['snippet']);

            if ($detectedStatus === null) {
                $skippedNoStatusCount++;

                continue;
            }

            try {
                EmailMessage::updateOrCreate(
                    ['gmail_message_id' => $data['gmail_message_id']],
                    [
                        'sender_email' => $data['sender_email'],
                        'sender_domain' => $data['sender_domain'],
                        'subject' => $data['subject'],
                        'snippet' => $data['snippet'],
                        'detected_status' => $detectedStatus,
                        'received_at' => $data['received_at'],
                    ]
                );

                $savedCount++;
            } catch (Exception $e) {
                Log::error('SyncGmailMessagesJob: gagal simpan 1 pesan.', [
                    'gmail_message_id' => $data['gmail_message_id'] ?? null,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('SyncGmailMessagesJob: selesai sinkronisasi.', [
            'user_id' => $this->user->id,
            'total_fetched' => $messages->count(),
            'total_saved' => $savedCount,
            'total_skipped_bot' => $skippedBotCount,
            'total_skipped_no_status' => $skippedNoStatusCount,
        ]);

        return $savedCount;
    }

    public function failed(Throwable $exception): void
    {
        Log::error('SyncGmailMessagesJob: job gagal total setelah semua retry.', [
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
