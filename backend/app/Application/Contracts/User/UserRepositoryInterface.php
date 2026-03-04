<?php

declare(strict_types=1);

namespace App\Application\Contracts\User;

use App\Domain\User\User;

interface UserRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function create(string $email, string $passwordHash, \DateTimeInterface $termsAcceptedAt, \DateTimeInterface $privacyAcceptedAt): User;
}
