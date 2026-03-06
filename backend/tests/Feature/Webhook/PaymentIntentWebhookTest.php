<?php

declare(strict_types=1);

namespace Tests\Feature\Webhook;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentIntentWebhookTest extends TestCase
{
    use RefreshDatabase;

    private const WEBHOOK_SECRET = 'whsec_test_secret';

    protected function setUp(): void
    {
        parent::setUp();
        config(['stripe.webhook_secret' => self::WEBHOOK_SECRET]);
    }

    public function test_payment_intent_succeeded_updates_payment_status(): void
    {
        $user = User::factory()->create();
        $payment = Payment::create([
            'id' => (string) \Illuminate\Support\Str::ulid(),
            'user_id' => $user->id,
            'stripe_payment_intent_id' => 'pi_test_123',
            'amount' => 1000,
            'currency' => 'gbp',
            'status' => 'pending',
        ]);

        $payload = json_encode([
            'id' => 'evt_test_1',
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => 'pi_test_123',
                    'amount' => 1000,
                    'currency' => 'gbp',
                    'status' => 'succeeded',
                    'metadata' => ['user_id' => $user->id],
                ],
            ],
        ]);

        $timestamp = time();
        $signed = hash_hmac('sha256', $timestamp . '.' . $payload, self::WEBHOOK_SECRET);

        $response = $this->call(
            'POST',
            '/api/webhooks/stripe',
            [],
            [],
            [],
            [
                'HTTP_STRIPE_SIGNATURE' => 't=' . $timestamp . ',v1=' . $signed,
                'CONTENT_TYPE' => 'application/json',
            ],
            $payload
        );

        $this->assertSame(200, $response->getStatusCode());

        $payment->refresh();
        $this->assertSame('succeeded', $payment->status);
    }

    public function test_payment_intent_payment_failed_updates_payment_status(): void
    {
        $user = User::factory()->create();
        $payment = Payment::create([
            'id' => (string) \Illuminate\Support\Str::ulid(),
            'user_id' => $user->id,
            'stripe_payment_intent_id' => 'pi_test_456',
            'amount' => 500,
            'currency' => 'gbp',
            'status' => 'pending',
        ]);

        $payload = json_encode([
            'id' => 'evt_test_2',
            'type' => 'payment_intent.payment_failed',
            'data' => [
                'object' => [
                    'id' => 'pi_test_456',
                    'amount' => 500,
                    'currency' => 'gbp',
                    'metadata' => ['user_id' => $user->id],
                ],
            ],
        ]);

        $timestamp = time();
        $signed = hash_hmac('sha256', $timestamp . '.' . $payload, self::WEBHOOK_SECRET);

        $response = $this->call(
            'POST',
            '/api/webhooks/stripe',
            [],
            [],
            [],
            [
                'HTTP_STRIPE_SIGNATURE' => 't=' . $timestamp . ',v1=' . $signed,
                'CONTENT_TYPE' => 'application/json',
            ],
            $payload
        );

        $this->assertSame(200, $response->getStatusCode());

        $payment->refresh();
        $this->assertSame('failed', $payment->status);
    }
}
