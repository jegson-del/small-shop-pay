<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

use App\Application\Contracts\Auth\AccessTokenServiceInterface;
use App\Application\Contracts\Auth\PasswordHasherInterface;
use App\Application\Contracts\Auth\RefreshTokenRepositoryInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use App\Domain\Auth\RefreshToken;
use InvalidArgumentException;
use Illuminate\Support\Str;

/**
 * SOLID: Single Responsibility – authenticates user and issues tokens.
 * Dependency Inversion – depends on interfaces.
 */
final readonly class LoginUserUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private PasswordHasherInterface $passwordHasher,
        private RefreshTokenRepositoryInterface $refreshTokenRepository,
        private AccessTokenServiceInterface $accessTokenService,
    ) {
    }

    /**
     * @throws InvalidArgumentException When credentials are invalid
     */
    public function execute(LoginUserInput $input): LoginUserOutput
    {
        $user = $this->userRepository->findByEmail($input->email);

        if ($user === null || ! $this->passwordHasher->verify($input->password, $user->passwordHash)) {
            throw new InvalidArgumentException('Invalid credentials.');
        }

        $accessTokenExpiresIn = 900; // 15 minutes (Blueprint v6)
        $accessResult = $this->accessTokenService->createAccessToken($user->id, $accessTokenExpiresIn);

        $refreshTokenPlain = Str::random(64);
        $refreshTokenHash = hash('sha256', $refreshTokenPlain);
        $expiresAt = (new \DateTimeImmutable)->modify('+30 days');

        $refreshToken = new RefreshToken(
            id: (string) Str::ulid(),
            userId: $user->id,
            tokenHash: $refreshTokenHash,
            expiresAt: $expiresAt,
            revokedAt: null,
            createdAt: new \DateTimeImmutable,
        );

        $this->refreshTokenRepository->create($refreshToken);

        return new LoginUserOutput(
            accessToken: $accessResult['plainTextToken'],
            refreshToken: $refreshTokenPlain,
            expiresIn: $accessTokenExpiresIn,
        );
    }
}
