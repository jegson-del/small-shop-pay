<?php

declare(strict_types=1);

namespace App\Application\Contracts\Auth;

use App\Domain\Auth\RefreshToken;

interface RefreshTokenRepositoryInterface
{
    public function create(RefreshToken $token): void;

    public function findByTokenHash(string $tokenHash): ?RefreshToken;

    public function revoke(string $tokenHash): void;

    public function revokeAllForUser(string $userId): void;
}
