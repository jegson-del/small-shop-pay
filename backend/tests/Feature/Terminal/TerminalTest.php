<?php

declare(strict_types=1);

namespace Tests\Feature\Terminal;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TerminalTest extends TestCase
{
    use RefreshDatabase;

    public function test_connection_token_requires_authentication(): void
    {
        $response = $this->postJson('/api/terminal/connection_token');

        $response->assertStatus(401);
    }

    public function test_connection_token_requires_merchant_can_accept_payments(): void
    {
        $user = User::factory()->create([
            'stripe_account_id' => null,
            'subscription_status' => 'none',
            'app_access' => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/terminal/connection_token');

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => 'Subscription required. Please activate your account or renew your subscription in the SmallShopPay dashboard.']);
    }

    public function test_connection_token_returns_403_when_subscription_expired(): void
    {
        $user = User::factory()->create([
            'stripe_account_id' => 'acct_test',
            'subscription_status' => 'canceled',
            'app_access' => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/terminal/connection_token');

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => 'Subscription required. Please activate your account or renew your subscription in the SmallShopPay dashboard.']);
    }

    public function test_payment_intent_requires_authentication(): void
    {
        $response = $this->postJson('/api/terminal/payment_intent', [
            'amount' => 1000,
            'currency' => 'gbp',
        ]);

        $response->assertStatus(401);
    }

    public function test_payment_intent_requires_merchant_can_accept_payments(): void
    {
        $user = User::factory()->create([
            'stripe_account_id' => null,
            'subscription_status' => 'none',
            'app_access' => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/terminal/payment_intent', [
            'amount' => 1000,
            'currency' => 'gbp',
        ]);

        $response->assertStatus(403);
    }

    public function test_payment_intent_validates_amount_required(): void
    {
        $user = User::factory()->create([
            'stripe_account_id' => 'acct_test',
            'subscription_status' => 'trialing',
            'app_access' => true,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/terminal/payment_intent', [
            'currency' => 'gbp',
        ]);

        $response->assertStatus(422);
    }

    public function test_payment_intent_validates_amount_min(): void
    {
        $user = User::factory()->create([
            'stripe_account_id' => 'acct_test',
            'subscription_status' => 'trialing',
            'app_access' => true,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/terminal/payment_intent', [
            'amount' => 0,
            'currency' => 'gbp',
        ]);

        $response->assertStatus(422);
    }

    public function test_payment_intent_validates_currency(): void
    {
        $user = User::factory()->create([
            'stripe_account_id' => 'acct_test',
            'subscription_status' => 'trialing',
            'app_access' => true,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/terminal/payment_intent', [
            'amount' => 1000,
            'currency' => 'invalid',
        ]);

        $response->assertStatus(422);
    }
}
