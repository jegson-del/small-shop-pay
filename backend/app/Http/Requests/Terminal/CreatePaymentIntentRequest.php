<?php

declare(strict_types=1);

namespace App\Http\Requests\Terminal;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:1'], // amount in smallest currency unit (e.g. pence)
            'currency' => ['sometimes', 'string', 'size:3', 'in:gbp,eur,usd'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.min' => 'Amount must be at least 1.',
            'currency.in' => 'Currency must be gbp, eur, or usd.',
        ];
    }
}
