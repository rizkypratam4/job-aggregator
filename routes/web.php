<?php

use App\Http\Controllers\EmailController;
use App\Http\Controllers\GmailAuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [GmailAuthController::class, 'index'])->name('login');
Route::get('/auth/google/redirect', [GmailAuthController::class, 'redirectToGoogle'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GmailAuthController::class, 'handleCallback'])->name('auth.google.callback');
Route::post('/logout', [GmailAuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', ['title' => 'Dashboard']);
    })->name('dashboard');

    Route::get('/job', function () {
        return Inertia::render('JobListings/Index', ['title' => 'Job Listings']);
    });

    // emails
    Route::get('/emails', [EmailController::class, 'index'])->name('emails.index');
    Route::post('/emails/refresh', [EmailController::class, 'refresh'])->name('emails.refresh');

    // profiles
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
});