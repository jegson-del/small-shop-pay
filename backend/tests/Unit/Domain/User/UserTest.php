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
        $withStripe = new User('1', 'a@b.com', 'h', 'acct_x', null, null, 'none', null, false, new DateTimeImmutable, new DateTimeImmutable, null, null, null);
        $withoutStripe = new User('2', 'c@d.com', 'h', null, null, null, 'none', null, false, null, null, null, null, null);

        $this->assertTrue($withStripe->hasStripeConnected());
        $this->assertTrue($withStripe->hasAcceptedTerms());
        $this->assertFalse($withoutStripe->hasStripeConnected());
        $this->assertFalse($withoutStripe->hasAcceptedTerms());
    }

    public function test_can_accept_payments_when_subscription_active_or_trialing(): void
    {
        $active = new User('1', 'a@b.com', 'h', 'acct_x', 'cus_x', 'sub_x', 'active', null, true, null, null, null, null, null);
        $trialing = new User('2', 'b@c.com', 'h', 'acct_y', 'cus_y', 'sub_y', 'trialing', new DateTimeImmutable('+7 days'), true, null, null, null, null, null);
        $none = new User('3', 'c@d.com', 'h', 'acct_z', null, null, 'none', null, false, null, null, null, null, null);

        $this->assertTrue($active->canAcceptPayments());
        $this->assertTrue($trialing->canAcceptPayments());
        $this->assertFalse($none->canAcceptPayments());
    }
}
