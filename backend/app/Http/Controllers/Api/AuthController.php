<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Requests\Auth\RefreshRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Application\UseCases\Auth\LoginUserInput;
use App\Application\UseCases\Auth\LoginUserUseCase;
use App\Application\UseCases\Auth\LogoutUserInput;
use App\Application\UseCases\Auth\LogoutUserUseCase;
use App\Application\UseCases\Auth\RefreshTokenInput;
use App\Application\UseCases\Auth\RefreshTokenUseCase;
use App\Application\UseCases\Auth\RegisterUserInput;
use App\Application\UseCases\Auth\RegisterUserUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class AuthController extends Controller
{
    public function __construct(
        private RegisterUserUseCase $registerUseCase,
        private LoginUserUseCase $loginUseCase,
        private RefreshTokenUseCase $refreshUseCase,
        private LogoutUserUseCase $logoutUseCase,
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $input = new RegisterUserInput(
                email: $request->validated('email'),
                password: $request->validated('password'),
                termsAccepted: (bool) $request->validated('terms_accepted'),
                privacyAccepted: (bool) $request->validated('privacy_accepted'),
            );
            $user = $this->registerUseCase->execute($input);
            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $input = new LoginUserInput(
                $request->validated('email'),
                $request->validated('password'),
            );
            $output = $this->loginUseCase->execute($input);
            return response()->json([
                'access_token' => $output->accessToken,
                'refresh_token' => $output->refreshToken,
                'expires_in' => $output->expiresIn,
            ]);
        } catch (InvalidArgumentException) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }
    }

    public function refresh(RefreshRequest $request): JsonResponse
    {
        try {
            $input = new RefreshTokenInput($request->validated('refresh_token'));
            $output = $this->refreshUseCase->execute($input);
            return response()->json([
                'access_token' => $output->accessToken,
                'refresh_token' => $output->refreshToken,
                'expires_in' => $output->expiresIn,
            ]);
        } catch (InvalidArgumentException) {
            return response()->json(['message' => 'Invalid or expired refresh token.'], 401);
        }
    }

    public function logout(LogoutRequest $request): JsonResponse
    {
        $input = new LogoutUserInput($request->validated('refresh_token'));
        $this->logoutUseCase->execute($input);
        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'stripe_account_id' => $user->stripe_account_id,
            'stripe_customer_id' => $user->stripe_customer_id,
            'charges_enabled' => null,
            'payouts_enabled' => null,
            'subscription_status' => $user->subscription_status ?? 'none',
            'app_access' => (bool) ($user->app_access ?? false),
            'trial_end' => $user->trial_end?->format('c'),
        ]);
    }
}
