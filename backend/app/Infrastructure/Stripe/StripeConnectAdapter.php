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
            'capabilities' => [
                'card_payments' => ['requested' => true],
                'transfers' => ['requested' => true],
            ],
        ]);

        return ['id' => $account->id];
    }

    /**
     * Create a Terminal Location for the Connect account (required for in-person payments).
     *
     * @param array{line1: string, city?: string, postcode?: string, country: string}|null $address Optional address; uses placeholder if null
     * @return array{id: string}
     */
    public function createTerminalLocation(string $accountId, ?array $address = null): array
    {
        $line1 = !empty($address['line1']) ? $address['line1'] : 'N/A';
        $country = !empty($address['country']) ? $address['country'] : $this->country;
        $addr = ['line1' => $line1, 'country' => $country];
        if (!empty($address['city'])) {
            $addr['city'] = $address['city'];
        }
        if (!empty($address['postcode'])) {
            $addr['postal_code'] = $address['postcode'];
        }

        $location = $this->stripe->terminal->locations->create(
            [
                'display_name' => 'Main Shop',
                'address' => $addr,
            ],
            ['stripe_account' => $accountId]
        );

        return ['id' => $location->id];
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
