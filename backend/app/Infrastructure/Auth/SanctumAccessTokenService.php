<?php

declare(strict_types=1);

namespace App\Infrastructure\Auth;

use App\Application\Contracts\Auth\AccessTokenServiceInterface;
use App\Models\User;

final class SanctumAccessTokenService implements AccessTokenServiceInterface
{
    public function createAccessToken(string $userId, int $expiresInSeconds): array
    {
        $user = User::findOrFail($userId);
        $expiresAt = now()->addSeconds($expiresInSeconds);
        $token = $user->createToken('access', ['*'], $expiresAt);

        return [
            'plainTextToken' => $token->plainTextToken,
            'expiresAt' => $expiresAt->toDateTimeImmutable(),
        ];
    }
}
