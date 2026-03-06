<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Contracts\User\UserRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class MerchantStatusController extends Controller
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
    ) {
    }

    /**
     * Get subscription status for mobile app gating.
     * GET /api/merchant/status
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $domainUser = $this->userRepository->findById((string) $user->id);
        if ($domainUser === null) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        return response()->json([
            'subscription_status' => $domainUser->subscriptionStatus,
            'app_access' => $domainUser->appAccess,
            'trial_end' => $domainUser->trialEnd?->format('c'),
            'subscription_id' => $domainUser->subscriptionId,
        ]);
    }
}
