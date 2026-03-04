<?php

declare(strict_types=1);

namespace App\Domain\Auth;

use DateTimeInterface;

/**
 * Domain RefreshToken entity. Framework-agnostic.
 * SOLID: Single Responsibility – represents a refresh token and its lifecycle.
 */
final readonly class RefreshToken
{
    public function __construct(
        public string $id,
        public string $userId,
        public string $tokenHash,
        public DateTimeInterface $expiresAt,
        public ?DateTimeInterface $revokedAt = null,
        public ?DateTimeInterface $createdAt = null,
    ) {
    }

    public function isExpired(): bool
    {
        return $this->expiresAt <= new \DateTimeImmutable;
    }

    public function isRevoked(): bool
    {
        return $this->revokedAt !== null;
    }

    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isRevoked();
    }
}
