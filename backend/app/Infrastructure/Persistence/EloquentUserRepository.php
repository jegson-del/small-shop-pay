<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Contracts\User\UserRepositoryInterface;
use App\Domain\User\User;
use App\Models\User as EloquentUser;
use DateTimeImmutable;

final class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(string $id): ?User
    {
        $model = EloquentUser::find($id);

        return $model ? $this->toDomain($model) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $model = EloquentUser::where('email', $email)->first();

        return $model ? $this->toDomain($model) : null;
    }

    public function findByStripeAccountId(string $stripeAccountId): ?User
    {
        $model = EloquentUser::where('stripe_account_id', $stripeAccountId)->first();

        return $model ? $this->toDomain($model) : null;
    }

    public function create(string $email, string $passwordHash, \DateTimeInterface $termsAcceptedAt, \DateTimeInterface $privacyAcceptedAt): User
    {
        $name = $this->deriveNameFromEmail($email);

        $model = EloquentUser::create([
            'name' => $name,
            'email' => $email,
            'password' => $passwordHash,
            'terms_accepted_at' => $termsAcceptedAt,
            'privacy_accepted_at' => $privacyAcceptedAt,
        ]);

        return $this->toDomain($model);
    }

    public function updateStripeAccountId(string $userId, string $stripeAccountId): void
    {
        EloquentUser::where('id', $userId)->update(['stripe_account_id' => $stripeAccountId]);
    }

    public function updateSubscription(
        string $userId,
        string $stripeCustomerId,
        string $subscriptionId,
        string $subscriptionStatus,
        ?\DateTimeInterface $trialEnd,
        bool $appAccess
    ): void {
        EloquentUser::where('id', $userId)->update([
            'stripe_customer_id' => $stripeCustomerId,
            'subscription_id' => $subscriptionId,
            'subscription_status' => $subscriptionStatus,
            'trial_end' => $trialEnd,
            'app_access' => $appAccess,
        ]);
    }

    public function findBySubscriptionId(string $subscriptionId): ?User
    {
        $model = EloquentUser::where('subscription_id', $subscriptionId)->first();

        return $model ? $this->toDomain($model) : null;
    }

    public function updateSubscriptionAppAccess(string $userId, bool $appAccess): void
    {
        EloquentUser::where('id', $userId)->update(['app_access' => $appAccess]);
    }

    public function updateSubscriptionStatus(string $userId, string $status): void
    {
        EloquentUser::where('id', $userId)->update(['subscription_status' => $status]);
    }

    private function toDomain(EloquentUser $model): User
    {
        return new User(
            id: (string) $model->id,
            email: $model->email,
            passwordHash: $model->password,
            stripeAccountId: $model->stripe_account_id,
            stripeCustomerId: $model->stripe_customer_id,
            subscriptionId: $model->subscription_id,
            subscriptionStatus: $model->subscription_status ?? 'none',
            trialEnd: $model->trial_end?->toDateTimeImmutable(),
            appAccess: (bool) $model->app_access,
            termsAcceptedAt: $model->terms_accepted_at?->toDateTimeImmutable(),
            privacyAcceptedAt: $model->privacy_accepted_at?->toDateTimeImmutable(),
            emailVerifiedAt: $model->email_verified_at?->toDateTimeImmutable(),
            createdAt: $model->created_at?->toDateTimeImmutable(),
            updatedAt: $model->updated_at?->toDateTimeImmutable(),
        );
    }

    private function deriveNameFromEmail(string $email): string
    {
        $local = explode('@', $email)[0] ?? 'Merchant';

        return ucfirst(strtolower($local));
    }
}
