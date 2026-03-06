<?php

declare(strict_types=1);

namespace App\Domain\User;

use DateTimeInterface;

/**
 * Domain User entity. Framework-agnostic, no Eloquent dependency.
 * SOLID: Single Responsibility – represents user identity and attributes.
 */
final readonly class User
{
    public function __construct(
        public string $id,
        public string $email,
        public string $passwordHash,
        public ?string $stripeAccountId = null,
        public ?string $stripeCustomerId = null,
        public ?string $subscriptionId = null,
        public string $subscriptionStatus = 'none',
        public ?DateTimeInterface $trialEnd = null,
        public bool $appAccess = false,
        public ?DateTimeInterface $termsAcceptedAt = null,
        public ?DateTimeInterface $privacyAcceptedAt = null,
        public ?DateTimeInterface $emailVerifiedAt = null,
        public ?DateTimeInterface $createdAt = null,
        public ?DateTimeInterface $updatedAt = null,
    ) {
    }

    public function canAcceptPayments(): bool
    {
        return in_array($this->subscriptionStatus, ['active', 'trialing'], true) && $this->appAccess;
    }

    public function hasStripeConnected(): bool
    {
        return $this->stripeAccountId !== null;
    }

    public function hasAcceptedTerms(): bool
    {
        return $this->termsAcceptedAt !== null;
    }

    public function hasAcceptedPrivacy(): bool
    {
        return $this->privacyAcceptedAt !== null;
    }

    public function isEmailVerified(): bool
    {
        return $this->emailVerifiedAt !== null;
    }
}
