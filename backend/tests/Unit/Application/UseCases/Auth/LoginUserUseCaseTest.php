<?php

declare(strict_types=1);

namespace Tests\Unit\Application\UseCases\Auth;

use App\Application\Contracts\Auth\AccessTokenServiceInterface;
use App\Application\Contracts\Auth\PasswordHasherInterface;
use App\Application\Contracts\Auth\RefreshTokenRepositoryInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use App\Application\UseCases\Auth\LoginUserInput;
use App\Application\UseCases\Auth\LoginUserUseCase;
use App\Domain\User\User;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class LoginUserUseCaseTest extends TestCase
{
    private LoginUserUseCase $useCase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->useCase = new LoginUserUseCase(
            $this->createMock(UserRepositoryInterface::class),
            $this->createMock(PasswordHasherInterface::class),
            $this->createMock(RefreshTokenRepositoryInterface::class),
            $this->createMock(AccessTokenServiceInterface::class),
        );
    }

    public function test_returns_tokens_on_valid_credentials(): void
    {
        $user = new User('1', 'a@b.com', 'hashed', null, null, null, 'none', null, false, null, null, null, null, null);
        $userRepo = $this->createMock(UserRepositoryInterface::class);
        $userRepo->method('findByEmail')->willReturn($user);
        $pwHasher = $this->createMock(PasswordHasherInterface::class);
        $pwHasher->method('verify')->willReturn(true);
        $accessSvc = $this->createMock(AccessTokenServiceInterface::class);
        $accessSvc->method('createAccessToken')->willReturn(['plainTextToken' => 'tok', 'expiresAt' => new \DateTimeImmutable]);

        $useCase = new LoginUserUseCase($userRepo, $pwHasher, $this->createMock(RefreshTokenRepositoryInterface::class), $accessSvc);
        $output = $useCase->execute(new LoginUserInput('a@b.com', 'pass'));

        $this->assertSame('tok', $output->accessToken);
        $this->assertNotEmpty($output->refreshToken);
    }

    /** @dataProvider invalidCredentialsProvider */
    public function test_throws_on_invalid_credentials(?User $user, bool $verifyResult): void
    {
        $userRepo = $this->createMock(UserRepositoryInterface::class);
        $userRepo->method('findByEmail')->willReturn($user);
        $pwHasher = $this->createMock(PasswordHasherInterface::class);
        $pwHasher->method('verify')->willReturn($verifyResult);

        $useCase = new LoginUserUseCase($userRepo, $pwHasher, $this->createMock(RefreshTokenRepositoryInterface::class), $this->createMock(AccessTokenServiceInterface::class));

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid credentials.');

        $useCase->execute(new LoginUserInput('a@b.com', 'pass'));
    }

    public static function invalidCredentialsProvider(): array
    {
        $user = new User('1', 'a@b.com', 'hash', null, null, null, 'none', null, false, null, null, null, null, null);
        return [
            'unknown email' => [null, false],
            'wrong password' => [$user, false],
        ];
    }
}
