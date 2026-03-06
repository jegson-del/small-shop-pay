<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Contracts\User\UserRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private StripeClient $stripe,
    ) {
    }

    /**
     * Handle Stripe webhooks.
     * POST /api/webhooks/stripe
     */
    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('stripe.webhook_secret');

        if (!$webhookSecret || !$sigHeader) {
            Log::warning('Stripe webhook: missing secret or signature');
            return response('', 400);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe webhook signature verification failed', ['error' => $e->getMessage()]);
            return response('', 400);
        } catch (\Exception $e) {
            Log::error('Stripe webhook parse error', ['error' => $e->getMessage()]);
            return response('', 400);
        }

        try {
            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($event->data->object);
                    break;
                case 'invoice.payment_succeeded':
                    $this->handleInvoicePaymentSucceeded($event->data->object);
                    break;
                case 'invoice.payment_failed':
                    $this->handleInvoicePaymentFailed($event->data->object);
                    break;
                case 'customer.subscription.deleted':
                    $this->handleSubscriptionDeleted($event->data->object);
                    break;
                default:
                    // Log but do not fail for unhandled event types
                    Log::debug('Stripe webhook unhandled event', ['type' => $event->type]);
            }
        } catch (\Throwable $e) {
            Log::error('Stripe webhook handler error', [
                'event' => $event->type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response('', 500);
        }

        return response('', 200);
    }

    private function handleCheckoutSessionCompleted(object $session): void
    {
        $userId = $session->client_reference_id ?? null;
        if (!$userId) {
            Log::warning('checkout.session.completed: no client_reference_id');
            return;
        }

        $user = $this->userRepository->findById((string) $userId);
        if (!$user) {
            Log::warning('checkout.session.completed: user not found', ['user_id' => $userId]);
            return;
        }

        $customerId = $session->customer ?? null;
        $subscriptionId = $session->subscription ?? null;
        if (!$customerId || !$subscriptionId) {
            Log::warning('checkout.session.completed: missing customer or subscription');
            return;
        }

        $subscription = $this->stripe->subscriptions->retrieve($subscriptionId);
        $status = $subscription->status;
        $trialEnd = $subscription->trial_end
            ? (new \DateTimeImmutable())->setTimestamp((int) $subscription->trial_end)
            : null;
        $appAccess = in_array($status, ['active', 'trialing'], true);

        $this->userRepository->updateSubscription(
            (string) $userId,
            (string) $customerId,
            (string) $subscriptionId,
            $status,
            $trialEnd,
            $appAccess
        );

        Log::info('Subscription activated', ['user_id' => $userId, 'status' => $status]);
    }

    private function handleInvoicePaymentSucceeded(object $invoice): void
    {
        $subscriptionId = $invoice->subscription ?? null;
        if (!$subscriptionId) {
            return;
        }

        $user = $this->userRepository->findBySubscriptionId((string) $subscriptionId);
        if (!$user) {
            return;
        }

        $this->userRepository->updateSubscriptionAppAccess($user->id, true);
    }

    private function handleInvoicePaymentFailed(object $invoice): void
    {
        $subscriptionId = $invoice->subscription ?? null;
        if (!$subscriptionId) {
            return;
        }

        $user = $this->userRepository->findBySubscriptionId((string) $subscriptionId);
        if (!$user) {
            return;
        }

        $this->userRepository->updateSubscriptionAppAccess($user->id, false);
    }

    private function handleSubscriptionDeleted(object $subscription): void
    {
        $subscriptionId = $subscription->id ?? null;
        if (!$subscriptionId) {
            return;
        }

        $user = $this->userRepository->findBySubscriptionId((string) $subscriptionId);
        if (!$user) {
            return;
        }

        $this->userRepository->updateSubscriptionAppAccess($user->id, false);
        $this->userRepository->updateSubscriptionStatus($user->id, 'canceled');
    }
}
