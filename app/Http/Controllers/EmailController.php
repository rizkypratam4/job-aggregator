<?php

namespace App\Http\Controllers;

use App\Jobs\SyncGmailMessagesJob;
use App\Models\EmailMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EmailController extends Controller
{
    public function index(): Response
    {
        $emails = EmailMessage::query()
            ->latest('received_at')
            ->get([
                'id',
                'gmail_message_id',
                'sender_email',
                'sender_domain',
                'subject',
                'snippet',
                'detected_status',
                'received_at',
            ]);

        return Inertia::render('Emails/Index', [
            'emails' => $emails,
            'title' => 'Recruitment Emails'
        ]);
    }

    public function refresh(): RedirectResponse
    {
        $job = new SyncGmailMessagesJob(Auth::user());
        $savedCount = app()->call([$job, 'handle']);

        $message = $savedCount > 0
            ? "Sinkronisasi selesai. {$savedCount} email baru berhasil disinkronkan."
            : 'Sinkronisasi selesai. Tidak ada email rekrutmen baru ditemukan.';

        return redirect()
            ->route('emails.index')
            ->with('status', $message);
    }
}
