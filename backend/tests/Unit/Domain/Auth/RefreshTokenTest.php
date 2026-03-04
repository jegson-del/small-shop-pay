<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Auth;

use App\Domain\Auth\RefreshToken;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class RefreshTokenTest extends TestCase
{
    public function test_valid_token_is_valid(): void
    {
        $token = new RefreshToken('1', 'u1', 'h', new DateTimeImmutable('+30 days'), null, null);
        $this->assertTrue($token->isValid());
    }

    /** @dataProvider invalidTokenProvider */
    public function test_invalid_token_is_not_valid(RefreshToken $token): void
    {
        $this->assertFalse($token->isValid());
    }

    public static function invalidTokenProvider(): array
    {
        return [
            'expired' => [new RefreshToken('1', 'u1', 'h', new DateTimeImmutable('-1 hour'), null, null)],
            'revoked' => [new RefreshToken('1', 'u1', 'h', new DateTimeImmutable('+30 days'), new DateTimeImmutable, null)],
        ];
    }
}
