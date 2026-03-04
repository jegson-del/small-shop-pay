<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

use App\Application\Contracts\Auth\RefreshTokenRepositoryInterface;

/**
 * SOLID: Single Responsibility – revokes refresh token on logout.
 * Blueprint v6: Logout clears refresh token from database.
 */
final readonly class LogoutUserUseCase
{
    public function __construct(
        private RefreshTokenRepositoryInterface $refreshTokenRepository,
    ) {
    }

    public function execute(LogoutUserInput $input): void
    {
        $tokenHash = hash('sha256', $input->refreshToken);
        $this->refreshTokenRepository->revoke($tokenHash);
    }
}
