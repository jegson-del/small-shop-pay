<?php

declare(strict_types=1);

namespace App\Application\UseCases\StripeConnect;

use App\Application\Contracts\StripeConnect\StripeConnectAdapterInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use InvalidArgumentException;

final class GetStripeConnectStatusUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private StripeConnectAdapterInterface $stripeAdapter,
    ) {
    }

    /**
     * @return array{stripe_account_id: string|null, charges_enabled: bool, payouts_enabled: bool}
     */
    public function execute(string $userId): array
    {
        $user = $this->userRepository->findById($userId);
        if ($user === null) {
            throw new InvalidArgumentException('User not found.');
        }

        if ($user->stripeAccountId === null) {
            return [
                'stripe_account_id' => null,
                'charges_enabled' => false,
                'payouts_enabled' => false,
            ];
        }

        $status = $this->stripeAdapter->getAccountStatus($user->stripeAccountId);

        return [
            'stripe_account_id' => $user->stripeAccountId,
            'charges_enabled' => $status['charges_enabled'],
            'payouts_enabled' => $status['payouts_enabled'],
        ];
    }
}
