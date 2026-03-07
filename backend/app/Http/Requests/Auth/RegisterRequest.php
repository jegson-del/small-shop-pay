<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'email_confirmation' => ['required', 'string', 'email', 'max:255', 'same:email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'terms_accepted' => ['required', 'boolean', 'accepted'],
            'privacy_accepted' => ['required', 'boolean', 'accepted'],
        ];
    }
}
