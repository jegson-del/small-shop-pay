<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

final readonly class RefreshTokenOutput
{
    public function __construct(
        public string $accessToken,
        public string $refreshToken,
        public int $expiresIn,
    ) {
    }
}
