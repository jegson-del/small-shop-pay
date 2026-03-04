<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

final readonly class RegisterUserInput
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $termsAccepted,
        public bool $privacyAccepted,
    ) {
    }
}
