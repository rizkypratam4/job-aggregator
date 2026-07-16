<?php

use App\Jobs\SyncGmailMessagesJob;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    User::whereNotNull('gmail_access_token')->each(function (User $user) {
        app()->call([new SyncGmailMessagesJob($user), 'handle']);
    });
})->everyThirtyMinutes()->name('sync-gmail-messages')->withoutOverlapping();