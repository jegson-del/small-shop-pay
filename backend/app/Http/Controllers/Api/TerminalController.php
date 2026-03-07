<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Contracts\StripeConnect\StripeConnectAdapterInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use App\Application\UseCases\StripeConnect\GetStripeConnectStatusUseCase;
use App\Http\Controllers\Controller;
use App\Http\Requests\Terminal\CreatePaymentIntentRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Stripe\StripeClient;

/**
 * Phase 3: Stripe Terminal (Tap to Pay) – connection token and PaymentIntent.
 * All routes use merchant.can_accept_payments middleware.
 */
final class TerminalController extends Controller
{
    public function __construct(
        private StripeClient $stripe,
        private GetStripeConnectStatusUseCase $getConnectStatusUseCase,
        private StripeConnectAdapterInterface $stripeAdapter,
        private UserRepositoryInterface $userRepository,
    ) {
    }

    private function ensureConnectReady(Request $request): JsonResponse|null
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
            $status = $this->getConnectStatusUseCase->execute((string) $user->id);
        } catch (InvalidArgumentException) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if (!$status['charges_enabled'] || !$status['payouts_enabled']) {
            return response()->json([
                'message' => 'Stripe account is still being verified. Payments will be available once Stripe approves your account.',
            ], 403);
        }

        return null;
    }

    private function ensureTerminalLocation(string $userId, string $accountId): string|null
    {
        $user = $this->userRepository->findById($userId);
        if ($user === null || $user->terminalLocationId !== null) {
            return $user?->terminalLocationId;
        }

        $address = $user->hasAddressComplete()
            ? [
                'line1' => $user->addressLine1,
                'city' => $user->addressCity,
                'postcode' => $user->addressPostcode,
                'country' => $user->addressCountry ?? 'GB',
            ]
            : null;
        $location = $this->stripeAdapter->createTerminalLocation($accountId, $address);
        $this->userRepository->updateTerminalLocationId($userId, $location['id']);

        return $location['id'];
    }

    /**
     * Create a connection token for the Stripe Terminal SDK.
     * POST /api/terminal/connection_token
     */
    public function connectionToken(Request $request): JsonResponse
    {
        $block = $this->ensureConnectReady($request);
        if ($block !== null) {
            return $block;
        }

        $user = $request->user();
        $accountId = $user->stripe_account_id;

        try {
            $locationId = $this->ensureTerminalLocation((string) $user->id, $accountId);

            $token = $this->stripe->terminal->connectionTokens->create(
                [],
                ['stripe_account' => $accountId]
            );

            return response()->json([
                'secret' => $token->secret,
                'location_id' => $locationId,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['message' => 'Failed to create connection token.'], 502);
        }
    }

    /**
     * Get Terminal config (location ID) for the mobile app.
     * GET /api/terminal/config
     */
    public function config(Request $request): JsonResponse
    {
        $block = $this->ensureConnectReady($request);
        if ($block !== null) {
            return $block;
        }

        $user = $request->user();
        $locationId = $this->ensureTerminalLocation((string) $user->id, $user->stripe_account_id);

        return response()->json(['location_id' => $locationId]);
    }

    /**
     * Create a PaymentIntent for in-person (Tap to Pay) collection.
     * POST /api/terminal/payment_intent
     */
    public function createPaymentIntent(CreatePaymentIntentRequest $request): JsonResponse
    {
        $block = $this->ensureConnectReady($request);
        if ($block !== null) {
            return $block;
        }

        $user = $request->user();
        $accountId = $user->stripe_account_id;
        $this->ensureTerminalLocation((string) $user->id, $accountId);

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
