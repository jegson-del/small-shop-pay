<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Contracts\Auth\RefreshTokenRepositoryInterface;
use App\Domain\Auth\RefreshToken;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class EloquentRefreshTokenRepository implements RefreshTokenRepositoryInterface
{
    public function create(RefreshToken $token): void
    {
        DB::table('refresh_tokens')->insert([
            'id' => $token->id,
            'user_id' => $token->userId,
            'token_hash' => $token->tokenHash,
            'expires_at' => $token->expiresAt,
            'revoked_at' => $token->revokedAt,
            'created_at' => $token->createdAt ?? now(),
            'updated_at' => now(),
        ]);
    }

    public function findByTokenHash(string $tokenHash): ?RefreshToken
    {
        $row = DB::table('refresh_tokens')
            ->where('token_hash', $tokenHash)
            ->first();

        if (! $row) {
            return null;
        }

        return new RefreshToken(
            id: $row->id,
            userId: (string) $row->user_id,
            tokenHash: $row->token_hash,
            expiresAt: \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $row->expires_at),
            revokedAt: $row->revoked_at ? \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $row->revoked_at) : null,
            createdAt: $row->created_at ? \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $row->created_at) : null,
        );
    }

    public function revoke(string $tokenHash): void
    {
        DB::table('refresh_tokens')
            ->where('token_hash', $tokenHash)
            ->update(['revoked_at' => now(), 'updated_at' => now()]);
    }

    public function revokeAllForUser(string $userId): void
    {
        DB::table('refresh_tokens')
            ->where('user_id', $userId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now(), 'updated_at' => now()]);
    }

    public static function hashToken(string $plainToken): string
    {
        return hash('sha256', $plainToken);
    }
}
