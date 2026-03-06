<?php

declare(strict_types=1);

namespace App\Application\UseCases\StripeConnect;

use App\Application\Contracts\StripeConnect\StripeConnectAdapterInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use InvalidArgumentException;

final class CreateStripeConnectAccountUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private StripeConnectAdapterInterface $stripeAdapter,
    ) {
    }

    /**
     * Create Stripe Connect account and save account_id to user.
     *
     * @return array{account_id: string}
     */
    public function execute(string $userId): array
    {
        $user = $this->userRepository->findById($userId);
        if ($user === null) {
            throw new InvalidArgumentException('User not found.');
        }
        if ($user->stripeAccountId !== null) {
            throw new InvalidArgumentException('User already has a Stripe account connected.');
        }

        $result = $this->stripeAdapter->createExpressAccount($user->email);
        $this->userRepository->updateStripeAccountId($userId, $result['id']);

        return ['account_id' => $result['id']];
    }
}
