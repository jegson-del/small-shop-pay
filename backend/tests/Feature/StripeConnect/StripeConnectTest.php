<?php

declare(strict_types=1);

namespace Tests\Feature\StripeConnect;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeConnectTest extends TestCase
{
    use RefreshDatabase;

    public function test_connect_account_requires_authentication(): void
    {
        $response = $this->postJson('/api/stripe/connect/account');

        $response->assertStatus(401);
    }

    public function test_connect_status_requires_authentication(): void
    {
        $response = $this->getJson('/api/stripe/connect/status');

        $response->assertStatus(401);
    }

    public function test_connect_status_returns_status_when_authenticated(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/stripe/connect/status');

        // Without Stripe configured, may return 500 or 200 with status
        // With stripe_account_id null, GetStripeConnectStatusUseCase returns early without calling Stripe
        $response->assertOk();
        $response->assertJson([
            'stripe_account_id' => null,
            'charges_enabled' => false,
            'payouts_enabled' => false,
        ]);
    }

    public function test_return_and_refresh_routes_are_accessible_without_auth(): void
    {
        $returnResponse = $this->getJson('/api/stripe/return');
        $returnResponse->assertRedirect();

        $refreshResponse = $this->get('/api/stripe/refresh');
        $refreshResponse->assertRedirect();
    }
}
