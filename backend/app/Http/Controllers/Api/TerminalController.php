<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Terminal\CreatePaymentIntentRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stripe\StripeClient;

/**
 * Phase 3: Stripe Terminal (Tap to Pay) – connection token and PaymentIntent.
 * All routes use merchant.can_accept_payments middleware.
 */
final class TerminalController extends Controller
{
    public function __construct(
        private StripeClient $stripe,
    ) {
    }

    /**
     * Create a connection token for the Stripe Terminal SDK.
     * POST /api/terminal/connection_token
     */
    public function connectionToken(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $accountId = $user->stripe_account_id;
        if (!$accountId) {
            return response()->json([
                'message' => 'Connect your Stripe account first in the dashboard.',
            ], 403);
        }

        try {
            $token = $this->stripe->terminal->connectionTokens->create(
                [],
                ['stripe_account' => $accountId]
            );

            return response()->json(['secret' => $token->secret]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['message' => 'Failed to create connection token.'], 502);
        }
    }

    /**
     * Create a PaymentIntent for in-person (Tap to Pay) collection.
     * POST /api/terminal/payment_intent
     */
    public function createPaymentIntent(CreatePaymentIntentRequest $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $accountId = $user->stripe_account_id;
        if (!$accountId) {
            return response()->json([
                'message' => 'Connect your Stripe account first in the dashboard.',
            ], 403);
        }

        $amount = (int) $request->validated('amount');
        $currency = strtolower((string) ($request->validated('currency') ?? 'gbp'));

        try {
            $intent = $this->stripe->paymentIntents->create(
                [
                    'amount' => $amount,
                    'currency' => $currency,
                    'capture_method' => 'automatic',
                    'payment_method_types' => ['card_present'],
                    'metadata' => [
                        'user_id' => $user->id,
                    ],
                ],
                ['stripe_account' => $accountId]
            );

            Payment::create([
                'id' => (string) Str::ulid(),
                'user_id' => $user->id,
                'stripe_payment_intent_id' => $intent->id,
                'amount' => $amount,
                'currency' => $currency,
                'status' => 'pending',
            ]);

            return response()->json([
                'client_secret' => $intent->client_secret,
                'payment_intent_id' => $intent->id,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['message' => 'Failed to create payment.'], 502);
        }
    }
}
