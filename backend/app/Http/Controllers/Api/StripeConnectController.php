<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\StripeConnect\CreateStripeConnectAccountUseCase;
use App\Application\UseCases\StripeConnect\GetStripeConnectAccountLinkUseCase;
use App\Application\UseCases\StripeConnect\GetStripeConnectStatusUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class StripeConnectController extends Controller
{
    public function __construct(
        private CreateStripeConnectAccountUseCase $createAccountUseCase,
        private GetStripeConnectAccountLinkUseCase $getAccountLinkUseCase,
        private GetStripeConnectStatusUseCase $getStatusUseCase,
    ) {
    }

    /**
     * Create Connect account and return Account Link URL.
     * POST /api/stripe/connect/account
     */
    public function createAccount(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            if ($user->stripe_account_id === null) {
                $this->createAccountUseCase->execute((string) $user->id);
            }
            $result = $this->getAccountLinkUseCase->execute((string) $user->id);

            return response()->json([
                'url' => $result['url'],
                'account_id' => $result['account_id'],
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Get Connect account status.
     * GET /api/stripe/connect/status
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $status = $this->getStatusUseCase->execute((string) $user->id);

            return response()->json($status);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
