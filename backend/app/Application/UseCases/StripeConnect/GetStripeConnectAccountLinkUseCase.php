<?php

declare(strict_types=1);

namespace App\Application\UseCases\StripeConnect;

use App\Application\Contracts\StripeConnect\StripeConnectAdapterInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use InvalidArgumentException;

final class GetStripeConnectAccountLinkUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private StripeConnectAdapterInterface $stripeAdapter,
        private string $returnUrl,
        private string $refreshUrl,
    ) {
    }

    /**
     * Create Account Link for user's Stripe Connect account.
     *
     * @return array{url: string, account_id: string}
     */
    public function execute(string $userId): array
    {
        $user = $this->userRepository->findById($userId);
        if ($user === null) {
            throw new InvalidArgumentException('User not found.');
        }
        if ($user->stripeAccountId === null) {
            throw new InvalidArgumentException('User has no Stripe account. Create account first.');
        }

        $returnUrlWithAccount = $this->appendQueryParam($this->returnUrl, 'account_id', $user->stripeAccountId);
        $refreshUrlWithAccount = $this->appendQueryParam($this->refreshUrl, 'account_id', $user->stripeAccountId);

        $result = $this->stripeAdapter->createAccountLink(
            $user->stripeAccountId,
            $returnUrlWithAccount,
            $refreshUrlWithAccount,
        );

        return [
            'url' => $result['url'],
            'account_id' => $user->stripeAccountId,
        ];
    }

    private function appendQueryParam(string $url, string $key, string $value): string
    {
        $separator = str_contains($url, '?') ? '&' : '?';

        return $url . $separator . http_build_query([$key => $value]);
    }
}
