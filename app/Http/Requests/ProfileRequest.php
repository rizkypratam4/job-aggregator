<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'primary_skills' => ['nullable', 'array'],
            'primary_skills.*' => ['string', 'max:100'],
            'secondary_skills' => ['nullable', 'array'],
            'secondary_skills.*' => ['string', 'max:100'],
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'experience_summary' => ['nullable', 'string', 'max:2000'],
            'preferred_locations' => ['nullable', 'array'],
            'preferred_locations.*' => ['string', 'max:100'],
            'work_type' => ['required', 'in:remote,hybrid,onsite,any'],
            'level' => ['nullable', 'in:junior,mid,senior'],
            'expected_salary_min' => ['nullable', 'integer', 'min:0'],
            'expected_salary_max' => ['nullable', 'integer', 'min:0', 'gte:expected_salary_min'],
        ];
    }
}
