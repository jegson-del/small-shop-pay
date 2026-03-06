<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'merchant@example.com',
            'password' => 'SecurePass123!',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201)->assertJson(['email' => 'merchant@example.com']);
    }

    public function test_register_fails_without_terms_accepted(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'merchant@example.com',
            'password' => 'SecurePass123!',
            'terms_accepted' => false,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422);
    }

    public function test_register_fails_without_privacy_accepted(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'merchant@example.com',
            'password' => 'SecurePass123!',
            'terms_accepted' => true,
            'privacy_accepted' => false,
        ]);

        $response->assertStatus(422);
    }

    public function test_login_returns_tokens(): void
    {
        User::factory()->create(['email' => 'merchant@example.com', 'password' => bcrypt('pass123')]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'merchant@example.com',
            'password' => 'pass123',
        ]);

        $response->assertOk()->assertJsonStructure(['access_token', 'refresh_token', 'expires_in']);
    }

    public function test_me_returns_user_when_authenticated(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/auth/me');

        $response->assertOk()->assertJson(['email' => $user->email]);
    }
}
