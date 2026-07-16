<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable('gmail_message_id', 'sender_email', 'sender_domain', 'subject', 'snippet', 'detected_status', 'received_at')]
class EmailMessage extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
        ];
    }
}
