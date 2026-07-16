<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('email_messages', function (Blueprint $table) {
            $table->id();
            $table->string('gmail_message_id')->unique();
            $table->string('sender_email');
            $table->string('sender_domain');
            $table->string('subject')->nullable();
            $table->text('snippet')->nullable();
            $table->enum('detected_status', [
                'interview',
                'technical_test',
                'hr_interview',
                'user_interview',
                'offering',
                'rejected',
            ]);
            $table->timestamp('received_at');
            $table->timestamps();

            $table->index('received_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_messages');
    }
};
