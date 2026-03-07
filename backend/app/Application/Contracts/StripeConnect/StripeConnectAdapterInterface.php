<?php

declare(strict_types=1);

namespace App\Application\Contracts\StripeConnect;

interface StripeConnectAdapterInterface
{
    /**
     * Create a Stripe Connect Express account for the given email.
     *
     * @return array{id: string}
     */
    public function createExpressAccount(string $email): array;

    /**
     * Create an Account Link for onboarding.
     *
     * @return array{url: string}
     */
    public function createAccountLink(string $accountId, string $returnUrl, string $refreshUrl): array;

    /**
     * Retrieve account and return charges_enabled, payouts_enabled.
     *
     * @return array{charges_enabled: bool, payouts_enabled: bool}
     */
    public function getAccountStatus(string $accountId): array;

    /**
     * Create a Terminal Location for the Connect account.
     *
     * @param array{line1: string, city?: string, postcode?: string, country: string}|null $address Optional address; uses placeholder if null
     * @return array{id: string}
     */
    public function createTerminalLocation(string $accountId, ?array $address = null): array;
}
