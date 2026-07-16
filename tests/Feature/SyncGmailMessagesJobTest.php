<?php

use App\Jobs\SyncGmailMessagesJob;
use App\Models\EmailMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

/**
 * Helper untuk bikin response detail pesan Gmail API (format=metadata).
 */
function fakeGmailMessageDetail(string $id, string $fromEmail, string $subject, string $snippet = ''): array
{
    return [
        'id' => $id,
        'snippet' => $snippet,
        'internalDate' => (string) (now()->timestamp * 1000),
        'payload' => [
            'headers' => [
                ['name' => 'From', 'value' => "Test Sender <{$fromEmail}>"],
                ['name' => 'Subject', 'value' => $subject],
            ],
        ],
    ];
}

beforeEach(function () {
    config()->set('job-boards.bot_domains', ['glints.com', 'linkedin.com']);

    $this->user = User::factory()->create([
        'gmail_access_token' => 'fake-access-token',
        'gmail_refresh_token' => 'fake-refresh-token',
        'gmail_token_expires_at' => now()->addHour(),
    ]);
});

it('skips email from known job board bot domains entirely', function () {
    Http::fake(function ($request) {
        $url = $request->url();

        if (str_contains($url, '/messages?') || ! preg_match('#/messages/#', $url)) {
            return Http::response(['messages' => [['id' => 'msg-bot']]]);
        }

        return Http::response(
            fakeGmailMessageDetail('msg-bot', 'notifications@glints.com', 'Ada 5 lowongan baru untukmu!')
        );
    });

    app()->call([new SyncGmailMessagesJob($this->user), 'handle']);

    expect(EmailMessage::count())->toBe(0);
});

it('skips email that does not match any recruitment keyword', function () {
    Http::fake(function ($request) {
        $url = $request->url();

        if (str_contains($url, '/messages?') || ! preg_match('#/messages/#', $url)) {
            return Http::response(['messages' => [['id' => 'msg-generic']]]);
        }

        return Http::response(
            fakeGmailMessageDetail('msg-generic', 'someone@perusahaan.com', 'Terima kasih sudah menghubungi kami', 'Semoga harimu menyenangkan.')
        );
    });

    app()->call([new SyncGmailMessagesJob($this->user), 'handle']);

    expect(EmailMessage::count())->toBe(0);
});

it('saves email that passes both filters with correct detected_status', function () {
    Http::fake(function ($request) {
        $url = $request->url();

        if (str_contains($url, '/messages?') || ! preg_match('#/messages/#', $url)) {
            return Http::response(['messages' => [['id' => 'msg-valid']]]);
        }

        return Http::response(
            fakeGmailMessageDetail('msg-valid', 'hr@perusahaan.com', 'Undangan Interview - Backend Developer', 'Kami ingin mengundang Anda.')
        );
    });

    $savedCount = app()->call([new SyncGmailMessagesJob($this->user), 'handle']);

    expect(EmailMessage::count())->toBe(1)
        ->and($savedCount)->toBe(1);

    $email = EmailMessage::first();

    expect($email->gmail_message_id)->toBe('msg-valid')
        ->and($email->sender_email)->toBe('hr@perusahaan.com')
        ->and($email->sender_domain)->toBe('perusahaan.com')
        ->and($email->detected_status)->toBe('interview');
});

it('processes a mix of bot, unrelated, and valid emails correctly in one batch', function () {
    Http::fake(function ($request) {
        $url = $request->url();

        if (str_contains($url, '/messages?') || ! preg_match('#/messages/#', $url)) {
            return Http::response([
                'messages' => [
                    ['id' => 'msg-1-bot'],
                    ['id' => 'msg-2-no-keyword'],
                    ['id' => 'msg-3-valid'],
                ],
            ]);
        }

        preg_match('#/messages/([^?]+)#', $url, $matches);
        $id = $matches[1];

        return match ($id) {
            'msg-1-bot' => Http::response(
                fakeGmailMessageDetail('msg-1-bot', 'no-reply@linkedin.com', 'Lowongan baru untukmu')
            ),
            'msg-2-no-keyword' => Http::response(
                fakeGmailMessageDetail('msg-2-no-keyword', 'teman@gmail.com', 'Apa kabar?', 'Lama tidak berbincang.')
            ),
            'msg-3-valid' => Http::response(
                fakeGmailMessageDetail('msg-3-valid', 'hr@startup.io', 'Technical Test - Backend Role')
            ),
        };
    });

    $savedCount = app()->call([new SyncGmailMessagesJob($this->user), 'handle']);

    expect($savedCount)->toBe(1)
        ->and(EmailMessage::count())->toBe(1)
        ->and(EmailMessage::first()->detected_status)->toBe('technical_test');
});

it('returns zero when no messages are fetched from Gmail at all', function () {
    Http::fake(function ($request) {
        return Http::response(['messages' => []]);
    });

    $savedCount = app()->call([new SyncGmailMessagesJob($this->user), 'handle']);

    expect($savedCount)->toBe(0)
        ->and(EmailMessage::count())->toBe(0);
});

it('does not save duplicate rows when the same email is synced twice', function () {
    Http::fake(function ($request) {
        $url = $request->url();

        if (str_contains($url, '/messages?') || ! preg_match('#/messages/#', $url)) {
            return Http::response(['messages' => [['id' => 'msg-repeat']]]);
        }

        return Http::response(
            fakeGmailMessageDetail('msg-repeat', 'hr@perusahaan.com', 'Undangan Interview')
        );
    });

    app()->call([new SyncGmailMessagesJob($this->user), 'handle']);
    app()->call([new SyncGmailMessagesJob($this->user), 'handle']);

    expect(EmailMessage::count())->toBe(1);
});
