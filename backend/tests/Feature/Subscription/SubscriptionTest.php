<?php

declare(strict_types=1);

namespace Tests\Feature\Subscription;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscription_checkout_requires_authentication(): void
    {
        $response = $this->postJson('/api/stripe/subscription/checkout');

        $response->assertStatus(401);
    }

    public function test_merchant_status_requires_authentication(): void
    {
        $response = $this->getJson('/api/merchant/status');

        $response->assertStatus(401);
    }

    public function test_merchant_status_returns_subscription_status_when_authenticated(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/merchant/status');

        $response->assertOk();
        $response->assertJson([
            'subscription_status' => 'none',
            'app_access' => false,
        ]);
    }
}
