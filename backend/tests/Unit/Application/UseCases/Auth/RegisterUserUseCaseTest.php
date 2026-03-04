<?php

declare(strict_types=1);

namespace Tests\Unit\Application\UseCases\Auth;

use App\Application\Contracts\Auth\PasswordHasherInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use App\Application\UseCases\Auth\RegisterUserInput;
use App\Application\UseCases\Auth\RegisterUserUseCase;
use App\Domain\User\User;
use DateTimeImmutable;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class RegisterUserUseCaseTest extends TestCase
{
    private UserRepositoryInterface $userRepository;

    private PasswordHasherInterface $passwordHasher;

    private RegisterUserUseCase $useCase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userRepository = $this->createMock(UserRepositoryInterface::class);
        $this->passwordHasher = $this->createMock(PasswordHasherInterface::class);
        $this->useCase = new RegisterUserUseCase($this->userRepository, $this->passwordHasher);
    }

    public function test_registers_user_successfully(): void
    {
        $input = new RegisterUserInput(
            email: 'merchant@example.com',
            password: 'SecurePass123!',
            termsAccepted: true,
            privacyAccepted: true,
        );

        $this->userRepository->method('findByEmail')->with('merchant@example.com')->willReturn(null);
        $this->passwordHasher->method('hash')->with('SecurePass123!')->willReturn('hashed_password');

        $domainUser = new User(
            id: '1',
            email: 'merchant@example.com',
            passwordHash: 'hashed_password',
            stripeAccountId: null,
            termsAcceptedAt: new DateTimeImmutable,
            privacyAcceptedAt: new DateTimeImmutable,
            emailVerifiedAt: null,
            createdAt: new DateTimeImmutable,
            updatedAt: new DateTimeImmutable,
        );

        $this->userRepository->expects($this->once())
            ->method('create')
            ->with(
                'merchant@example.com',
                'hashed_password',
                $this->isInstanceOf(DateTimeImmutable::class),
                $this->isInstanceOf(DateTimeImmutable::class),
            )
            ->willReturn($domainUser);

        $result = $this->useCase->execute($input);

        $this->assertSame('merchant@example.com', $result->email);
    }

    public function test_throws_on_duplicate_email(): void
    {
        $input = new RegisterUserInput(
            email: 'existing@example.com',
            password: 'SecurePass123!',
            termsAccepted: true,
            privacyAccepted: true,
        );

        $existingUser = new User(
            id: '1',
            email: 'existing@example.com',
            passwordHash: 'hash',
            stripeAccountId: null,
            termsAcceptedAt: null,
            privacyAcceptedAt: null,
            emailVerifiedAt: null,
            createdAt: null,
            updatedAt: null,
        );

        $this->userRepository->method('findByEmail')->with('existing@example.com')->willReturn($existingUser);
        $this->userRepository->expects($this->never())->method('create');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Email already registered.');

        $this->useCase->execute($input);
    }

    public function test_throws_on_invalid_email(): void
    {
        $input = new RegisterUserInput(
            email: 'not-an-email',
            password: 'SecurePass123!',
            termsAccepted: true,
            privacyAccepted: true,
        );

        $this->userRepository->expects($this->never())->method('create');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid email address.');

        $this->useCase->execute($input);
    }
}
