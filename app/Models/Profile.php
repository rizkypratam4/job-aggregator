<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable('primary_skills', 'secondary_skills', 'years_of_experience', 'experience_summary', 'preferred_locations', 'work_type', 'level', 'expected_salary_min', 'expected_salary_max')]
class Profile extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'primary_skills' => 'array',
            'secondary_skills' => 'array',
            'preferred_locations' => 'array',
            'years_of_experience' => 'integer',
            'expected_salary_min' => 'integer',
            'expected_salary_max' => 'integer',
        ];
    }
}
