<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\UseCases\Subscription\CreateSubscriptionCheckoutUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Stripe\StripeClient;

class SubscriptionController extends Controller
{
    public function __construct(
        private CreateSubscriptionCheckoutUseCase $createCheckoutUseCase,
        private StripeClient $stripe,
    ) {
    }

    /**
     * Create Stripe Checkout session for subscription (14-day trial).
     * POST /api/stripe/subscription/checkout
     */
    public function checkout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $result = $this->createCheckoutUseCase->execute((string) $user->id);

            return response()->json([
                'url' => $result['url'],
                'session_id' => $result['session_id'],
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Create Stripe Billing Portal session for managing card and subscription.
     * POST /api/stripe/billing-portal
     */
    public function billingPortal(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $customerId = $user->stripe_customer_id;
        if (empty($customerId)) {
            return response()->json(['message' => 'No subscription found. Start your free trial first.'], 422);
        }

        $returnUrl = config('stripe.billing_portal.return_url');
        if (empty($returnUrl)) {
            $returnUrl = rtrim(config('services.frontend_url', config('app.url')), '/') . '/settings';
        }

        try {
            $session = $this->stripe->billingPortal->sessions->create([
                'customer' => $customerId,
                'return_url' => $returnUrl,
            ]);

            return response()->json(['url' => $session->url]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
