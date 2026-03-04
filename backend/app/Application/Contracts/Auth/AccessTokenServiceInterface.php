<?php

declare(strict_types=1);

namespace App\Application\Contracts\Auth;

interface AccessTokenServiceInterface
{
    /**
     * Create a short-lived access token for the user.
     *
     * @return array{plainTextToken: string, expiresAt: \DateTimeInterface}
     */
    public function createAccessToken(string $userId, int $expiresInSeconds): array;
}
