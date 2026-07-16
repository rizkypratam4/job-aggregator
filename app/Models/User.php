<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'google_id', 'gmail_access_token', 'gmail_refresh_token', 'gmail_token_expires_at', 'email_verified_at'])]
#[Hidden(['password', 'remember_token', 'gmail_access_token', 'gmail_refresh_token'])]

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'gmail_access_token' => 'encrypted',
            'gmail_refresh_token' => 'encrypted',
            'gmail_token_expires_at' => 'datetime',
        ];
    }
}
