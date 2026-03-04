<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

use App\Application\Contracts\Auth\PasswordHasherInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use App\Domain\User\User;
use InvalidArgumentException;

/**
 * SOLID: Single Responsibility – registers a new user.
 * Dependency Inversion – depends on UserRepository and PasswordHasher interfaces.
 */
final readonly class RegisterUserUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private PasswordHasherInterface $passwordHasher,
    ) {
    }

    /**
     * @throws InvalidArgumentException When validation fails (duplicate email, invalid email, weak password, terms not accepted)
     */
    public function execute(RegisterUserInput $input): User
    {
        $this->validateInput($input);

        if ($this->userRepository->findByEmail($input->email) !== null) {
            throw new InvalidArgumentException('Email already registered.');
        }

        $passwordHash = $this->passwordHasher->hash($input->password);
        $now = new \DateTimeImmutable;

        return $this->userRepository->create(
            $input->email,
            $passwordHash,
            $now,
            $now,
        );
    }

    private function validateInput(RegisterUserInput $input): void
    {
        if (! filter_var($input->email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Invalid email address.');
        }

        $minLength = 8;
        if (strlen($input->password) < $minLength) {
            throw new InvalidArgumentException('Password must be at least ' . $minLength . ' characters.');
        }

        if (! $input->termsAccepted || ! $input->privacyAccepted) {
            throw new InvalidArgumentException('Terms and Privacy Policy must be accepted.');
        }
    }
}
