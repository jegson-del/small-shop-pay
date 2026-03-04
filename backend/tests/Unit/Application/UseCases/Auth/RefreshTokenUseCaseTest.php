<?php

declare(strict_types=1);

namespace Tests\Unit\Application\UseCases\Auth;

use App\Application\Contracts\Auth\AccessTokenServiceInterface;
use App\Application\Contracts\Auth\RefreshTokenRepositoryInterface;
use App\Application\UseCases\Auth\RefreshTokenInput;
use App\Application\UseCases\Auth\RefreshTokenUseCase;
use App\Domain\Auth\RefreshToken;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class RefreshTokenUseCaseTest extends TestCase
{
    public function test_returns_new_tokens_on_valid_refresh_token(): void
    {
        $stored = new RefreshToken('1', 'u1', hash('sha256', 'old'), (new \DateTimeImmutable)->modify('+30 days'), null, null);
        $refreshRepo = $this->createMock(RefreshTokenRepositoryInterface::class);
        $refreshRepo->method('findByTokenHash')->willReturn($stored);
        $refreshRepo->expects($this->once())->method('revoke');
        $refreshRepo->expects($this->once())->method('create');

        $accessSvc = $this->createMock(AccessTokenServiceInterface::class);
        $accessSvc->method('createAccessToken')->willReturn(['plainTextToken' => 'new_access', 'expiresAt' => new \DateTimeImmutable]);

        $useCase = new RefreshTokenUseCase($refreshRepo, $accessSvc);
        $output = $useCase->execute(new RefreshTokenInput('old'));

        $this->assertSame('new_access', $output->accessToken);
        $this->assertNotEmpty($output->refreshToken);
    }

    public function test_throws_on_invalid_or_expired_refresh_token(): void
    {
        $refreshRepo = $this->createMock(RefreshTokenRepositoryInterface::class);
        $refreshRepo->method('findByTokenHash')->willReturn(null);
        $refreshRepo->expects($this->never())->method('create');

        $useCase = new RefreshTokenUseCase($refreshRepo, $this->createMock(AccessTokenServiceInterface::class));

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid or expired refresh token.');

        $useCase->execute(new RefreshTokenInput('invalid'));
    }
}
