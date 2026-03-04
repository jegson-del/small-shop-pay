<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Contracts\User\UserRepositoryInterface;
use App\Domain\User\User;
use App\Models\User as EloquentUser;
use DateTimeImmutable;

final class EloquentUserRepository implements UserRepositoryInterface
{
    public function findByEmail(string $email): ?User
    {
        $model = EloquentUser::where('email', $email)->first();

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

    private function toDomain(EloquentUser $model): User
    {
        return new User(
            id: (string) $model->id,
            email: $model->email,
            passwordHash: $model->password,
            stripeAccountId: $model->stripe_account_id,
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
