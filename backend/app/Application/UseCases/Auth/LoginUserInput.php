<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

final readonly class LoginUserInput
{
    public function __construct(
        public string $email,
        public string $password,
    ) {
    }
}
