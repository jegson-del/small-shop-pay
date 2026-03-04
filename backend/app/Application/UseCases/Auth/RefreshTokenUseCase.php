<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

use App\Application\Contracts\Auth\AccessTokenServiceInterface;
use App\Application\Contracts\Auth\RefreshTokenRepositoryInterface;
use App\Domain\Auth\RefreshToken;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * SOLID: Single Responsibility – issues new access token from valid refresh token.
 * Refresh token rotation: revokes old, creates new.
 */
final readonly class RefreshTokenUseCase
{
    public function __construct(
        private RefreshTokenRepositoryInterface $refreshTokenRepository,
        private AccessTokenServiceInterface $accessTokenService,
    ) {
    }

    /**
     * @throws InvalidArgumentException When refresh token is invalid
     */
    public function execute(RefreshTokenInput $input): RefreshTokenOutput
    {
        $tokenHash = hash('sha256', $input->refreshToken);
        $stored = $this->refreshTokenRepository->findByTokenHash($tokenHash);

        if ($stored === null || ! $stored->isValid()) {
            throw new InvalidArgumentException('Invalid or expired refresh token.');
        }

        $this->refreshTokenRepository->revoke($tokenHash);

        $accessTokenExpiresIn = 900;
        $accessResult = $this->accessTokenService->createAccessToken($stored->userId, $accessTokenExpiresIn);

        $newRefreshPlain = Str::random(64);
        $newRefreshHash = hash('sha256', $newRefreshPlain);
        $expiresAt = (new \DateTimeImmutable)->modify('+30 days');

        $newRefresh = new RefreshToken(
            id: (string) Str::ulid(),
            userId: $stored->userId,
            tokenHash: $newRefreshHash,
            expiresAt: $expiresAt,
            revokedAt: null,
            createdAt: new \DateTimeImmutable,
        );
        $this->refreshTokenRepository->create($newRefresh);

        return new RefreshTokenOutput(
            accessToken: $accessResult['plainTextToken'],
            refreshToken: $newRefreshPlain,
            expiresIn: $accessTokenExpiresIn,
        );
    }
}
