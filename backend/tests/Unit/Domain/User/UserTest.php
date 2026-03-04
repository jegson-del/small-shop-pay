<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\User;

use App\Domain\User\User;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function test_has_stripe_connected_and_accepted_terms_reflects_state(): void
    {
        $withStripe = new User('1', 'a@b.com', 'h', 'acct_x', new DateTimeImmutable, new DateTimeImmutable, null, null, null);
        $withoutStripe = new User('2', 'c@d.com', 'h', null, null, null, null, null, null);

        $this->assertTrue($withStripe->hasStripeConnected());
        $this->assertTrue($withStripe->hasAcceptedTerms());
        $this->assertFalse($withoutStripe->hasStripeConnected());
        $this->assertFalse($withoutStripe->hasAcceptedTerms());
    }
}
