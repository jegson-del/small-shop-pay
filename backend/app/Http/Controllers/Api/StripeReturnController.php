<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Contracts\User\UserRepositoryInterface;
use App\Application\Contracts\StripeConnect\StripeConnectAdapterInterface;
use App\Application\UseCases\StripeConnect\GetStripeConnectAccountLinkUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class StripeReturnController extends Controller
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private StripeConnectAdapterInterface $stripeAdapter,
    ) {
    }

    /**
     * Handle Stripe Connect return URL.
     * Redirects to frontend dashboard. No auth required - user comes from Stripe.
     */
    public function returnToDashboard(Request $request): RedirectResponse
    {
        $accountId = $request->query('account_id');
        if (! is_string($accountId) || $accountId === '') {
            return $this->redirectToDashboard(['error' => 'missing_account']);
        }

        $user = $this->userRepository->findByStripeAccountId($accountId);
        if ($user === null) {
            return $this->redirectToDashboard(['error' => 'account_not_found']);
        }

        try {
            $status = $this->stripeAdapter->getAccountStatus($accountId);

            // Create Terminal location when possible. If it fails (e.g. sandbox restrictions),
            // still return success — TerminalController will create it when user first uses Take Payment.
            if ($user->terminalLocationId === null) {
                try {
                    $address = $user->hasAddressComplete()
                        ? [
                            'line1' => $user->addressLine1,
                            'city' => $user->addressCity,
                            'postcode' => $user->addressPostcode,
                            'country' => $user->addressCountry ?? 'GB',
                        ]
                        : null;
                    $location = $this->stripeAdapter->createTerminalLocation($accountId, $address);
                    $this->userRepository->updateTerminalLocationId($user->id, $location['id']);
                } catch (\Throwable $e) {
                    Log::warning('Stripe return: Terminal location creation failed (will be created on first payment)', [
                        'account_id' => $accountId,
                        'message' => $e->getMessage(),
                    ]);
                }
            }

            $params = [
                'stripe' => 'return',
                'charges_enabled' => $status['charges_enabled'] ? '1' : '0',
                'payouts_enabled' => $status['payouts_enabled'] ? '1' : '0',
            ];
        } catch (\Throwable $e) {
            Log::error('Stripe return: status_check_failed', [
                'account_id' => $accountId,
                'message' => $e->getMessage(),
                'exception' => get_class($e),
            ]);
            $params = ['stripe' => 'return', 'error' => 'status_check_failed'];
        }

        return $this->redirectToDashboard($params);
    }

    /**
     * Handle Stripe Connect refresh URL.
     * Re-issue Account Link and redirect to Stripe.
     */
    public function refresh(Request $request): RedirectResponse|JsonResponse
    {
        $accountId = $request->query('account_id');
        if (! is_string($accountId) || $accountId === '') {
            return $this->redirectToDashboard(['error' => 'missing_account']);
        }

        $user = $this->userRepository->findByStripeAccountId($accountId);
        if ($user === null) {
            return $this->redirectToDashboard(['error' => 'account_not_found']);
        }

        try {
            $getAccountLinkUseCase = app(GetStripeConnectAccountLinkUseCase::class);
            $result = $getAccountLinkUseCase->execute($user->id);

            return redirect()->away($result['url']);
        } catch (\Throwable) {
            return $this->redirectToDashboard(['error' => 'refresh_link_failed']);
        }
    }

    private function redirectToDashboard(array $params): RedirectResponse
    {
        $baseUrl = rtrim(config('services.frontend_url'), '/');
        $dashboardUrl = $baseUrl . '/dashboard';
        $url = $dashboardUrl . (str_contains($dashboardUrl, '?') ? '&' : '?') . http_build_query($params);

        return redirect()->away($url);
    }
}
