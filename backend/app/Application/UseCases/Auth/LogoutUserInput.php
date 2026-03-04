<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

final readonly class LogoutUserInput
{
    public function __construct(
        public string $refreshToken,
    ) {
    }
}
