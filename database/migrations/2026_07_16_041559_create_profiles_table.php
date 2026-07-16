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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->json('primary_skills')->nullable();
            $table->json('secondary_skills')->nullable();
            $table->unsignedSmallInteger('years_of_experience')->nullable();
            $table->text('experience_summary')->nullable();
            $table->json('preferred_locations')->nullable();
            $table->enum('work_type', ['remote', 'hybrid', 'onsite', 'any'])->default('any');
            $table->enum('level', ['junior', 'mid', 'senior'])->nullable();
            $table->unsignedInteger('expected_salary_min')->nullable();
            $table->unsignedInteger('expected_salary_max')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
