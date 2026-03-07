<?php

declare(strict_types=1);

namespace App\Application\Contracts\User;

use App\Domain\User\User;

interface UserRepositoryInterface
{
    public function findById(string $id): ?User;

    public function findByEmail(string $email): ?User;

    public function findByStripeAccountId(string $stripeAccountId): ?User;

    public function create(string $email, string $passwordHash, \DateTimeInterface $termsAcceptedAt, \DateTimeInterface $privacyAcceptedAt): User;

    public function updateStripeAccountId(string $userId, string $stripeAccountId): void;

    public function updateSubscription(
        string $userId,
        string $stripeCustomerId,
        string $subscriptionId,
        string $subscriptionStatus,
        ?\DateTimeInterface $trialEnd,
        bool $appAccess
    ): void;

    public function findBySubscriptionId(string $subscriptionId): ?User;

    public function updateSubscriptionAppAccess(string $userId, bool $appAccess): void;

    public function updateSubscriptionStatus(string $userId, string $status): void;

    public function updateTerminalLocationId(string $userId, string $terminalLocationId): void;

    public function updateAddress(
        string $userId,
        string $line1,
        string $city,
        string $postcode,
        string $country
    ): void;
}
