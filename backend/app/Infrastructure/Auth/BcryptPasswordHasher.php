<?php

declare(strict_types=1);

namespace App\Infrastructure\Auth;

use App\Application\Contracts\Auth\PasswordHasherInterface;

final class BcryptPasswordHasher implements PasswordHasherInterface
{
    public function hash(string $password): string
    {
        return bcrypt($password);
    }

    public function verify(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }
}
