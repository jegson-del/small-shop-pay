<?php

declare(strict_types=1);

namespace App\Application\UseCases\Subscription;

use App\Application\Contracts\User\UserRepositoryInterface;
use InvalidArgumentException;
use Stripe\StripeClient;

final class CreateSubscriptionCheckoutUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private StripeClient $stripe,
        private int $priceAmountPence,
        private int $trialDays,
        private string $successUrl,
        private string $cancelUrl,
    ) {
    }

    /**
     * @return array{url: string, session_id: string}
     */
    public function execute(string $userId): array
    {
        $user = $this->userRepository->findById($userId);
        if ($user === null) {
            throw new InvalidArgumentException('User not found.');
        }
        if ($user->stripeAccountId === null) {
            throw new InvalidArgumentException('Complete Stripe Connect onboarding first.');
        }
        if (in_array($user->subscriptionStatus, ['active', 'trialing'], true)) {
            throw new InvalidArgumentException('You already have an active subscription.');
        }

        $successUrl = rtrim($this->successUrl, '/') . '?session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl = rtrim($this->cancelUrl, '/');

        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'subscription',
            'customer_email' => $user->email,
            'client_reference_id' => $userId,
            'line_items' => [[
                'price_data' => [
                    'currency' => 'gbp',
                    'product_data' => [
                        'name' => 'SmallShopPay Platform',
                        'description' => '£9/month – Accept contactless payments with your phone. 14-day free trial.',
                        'metadata' => [
                            'user_id' => $userId,
                        ],
                    ],
                    'unit_amount' => $this->priceAmountPence,
                    'recurring' => [
                        'interval' => 'month',
                    ],
                ],
                'quantity' => 1,
            ]],
            'subscription_data' => [
                'trial_period_days' => $this->trialDays,
                'metadata' => [
                    'user_id' => $userId,
                ],
            ],
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
        ]);

        return [
            'url' => $session->url,
            'session_id' => $session->id,
        ];
    }
}
