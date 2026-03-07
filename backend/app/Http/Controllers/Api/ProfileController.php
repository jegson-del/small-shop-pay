<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Contracts\User\UserRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateAddressRequest;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
    ) {
    }

    /**
     * Update the authenticated user's address.
     * PUT /api/profile/address
     */
    public function updateAddress(UpdateAddressRequest $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $this->userRepository->updateAddress(
            (string) $user->id,
            $request->validated('address_line1'),
            $request->validated('address_city'),
            $request->validated('address_postcode'),
            strtoupper($request->validated('address_country')),
        );

        return response()->json(['message' => 'Address updated.']);
    }
}
