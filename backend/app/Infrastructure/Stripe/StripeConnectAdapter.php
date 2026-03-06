<?php

declare(strict_types=1);

namespace App\Infrastructure\Stripe;

use App\Application\Contracts\StripeConnect\StripeConnectAdapterInterface;
use Stripe\StripeClient;

final class StripeConnectAdapter implements StripeConnectAdapterInterface
{
    public function __construct(
        private StripeClient $stripe,
        private string $country = 'GB',
    ) {
    }

    public function createExpressAccount(string $email): array
    {
        $account = $this->stripe->accounts->create([
            'type' => 'express',
            'country' => $this->country,
            'email' => $email,
        ]);

        return ['id' => $account->id];
    }

    public function createAccountLink(string $accountId, string $returnUrl, string $refreshUrl): array
    {
        $link = $this->stripe->accountLinks->create([
            'account' => $accountId,
            'refresh_url' => $refreshUrl,
            'return_url' => $returnUrl,
            'type' => 'account_onboarding',
        ]);

        return ['url' => $link->url];
    }

    public function getAccountStatus(string $accountId): array
    {
        $account = $this->stripe->accounts->retrieve($accountId);

        return [
            'charges_enabled' => (bool) $account->charges_enabled,
            'payouts_enabled' => (bool) $account->payouts_enabled,
        ];
    }
}
