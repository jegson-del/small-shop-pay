<?php

declare(strict_types=1);

namespace Tests\Unit\Application\UseCases\Auth;

use App\Application\Contracts\Auth\RefreshTokenRepositoryInterface;
use App\Application\UseCases\Auth\LogoutUserInput;
use App\Application\UseCases\Auth\LogoutUserUseCase;
use PHPUnit\Framework\TestCase;

class LogoutUserUseCaseTest extends TestCase
{
    public function test_revokes_refresh_token(): void
    {
        $refreshRepo = $this->createMock(RefreshTokenRepositoryInterface::class);
        $refreshRepo->expects($this->once())->method('revoke');

        $useCase = new LogoutUserUseCase($refreshRepo);
        $useCase->execute(new LogoutUserInput('some_refresh_token'));
    }
}
