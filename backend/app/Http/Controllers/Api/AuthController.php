<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Contracts\Auth\PasswordHasherInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Requests\Auth\RefreshRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SendRegistrationOtpRequest;
use App\Http\Requests\Auth\VerifyForgotPasswordOtpRequest;
use App\Http\Requests\Auth\VerifyRegistrationOtpRequest;
use App\Application\UseCases\Auth\LoginUserInput;
use App\Application\UseCases\Auth\LoginUserUseCase;
use App\Application\UseCases\Auth\LogoutUserInput;
use App\Application\UseCases\Auth\LogoutUserUseCase;
use App\Application\UseCases\Auth\RefreshTokenInput;
use App\Application\UseCases\Auth\RefreshTokenUseCase;
use App\Application\UseCases\Auth\RegisterUserInput;
use App\Application\UseCases\Auth\RegisterUserUseCase;
use App\Mail\OtpMail;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use InvalidArgumentException;

class AuthController extends Controller
{
    public function __construct(
        private RegisterUserUseCase $registerUseCase,
        private LoginUserUseCase $loginUseCase,
        private RefreshTokenUseCase $refreshUseCase,
        private LogoutUserUseCase $logoutUseCase,
        private OtpService $otpService,
        private UserRepositoryInterface $userRepository,
        private PasswordHasherInterface $passwordHasher,
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

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        $user = $this->userRepository->findByEmail($email);
        if ($user === null) {
            return response()->json(['message' => 'If that email exists, we sent an OTP.']);
        }
        $otp = $this->otpService->storeForgotPassword($email);
        Mail::to($email)->send(new OtpMail($otp, 'Use this code to reset your password.'));
        return response()->json(['message' => 'If that email exists, we sent an OTP.']);
    }

    public function verifyForgotPasswordOtp(VerifyForgotPasswordOtpRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        $otp = $request->validated('otp');
        if (! $this->otpService->verifyForgotPassword($email, $otp)) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 422);
        }
        $resetToken = $this->otpService->createResetToken($email);
        return response()->json(['reset_token' => $resetToken]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $resetToken = $request->validated('reset_token');
        $email = $this->otpService->verifyResetToken($resetToken);
        if ($email === null) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }
        $user = $this->userRepository->findByEmail($email);
        if ($user === null) {
            return response()->json(['message' => 'User not found.'], 404);
        }
        $passwordHash = $this->passwordHasher->hash($request->validated('password'));
        $this->userRepository->updatePassword($user->id, $passwordHash);
        return response()->json(['message' => 'Password updated. You can now log in.']);
    }

    public function sendRegistrationOtp(SendRegistrationOtpRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        if ($this->userRepository->findByEmail($email) !== null) {
            return response()->json(['message' => 'Email already registered.'], 422);
        }
        $this->otpService->putRegistrationPending($email, [
            'password' => $this->passwordHasher->hash($request->validated('password')),
            'terms_accepted' => (bool) $request->validated('terms_accepted'),
            'privacy_accepted' => (bool) $request->validated('privacy_accepted'),
        ]);
        $otp = $this->otpService->storeRegistration($email);
        Mail::to($email)->send(new OtpMail($otp, 'Use this code to complete your SmallShopPay registration.'));
        return response()->json(['message' => 'OTP sent to your email.']);
    }

    public function verifyRegistrationOtp(VerifyRegistrationOtpRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        $otp = $request->validated('otp');
        if (! $this->otpService->verifyRegistration($email, $otp)) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 422);
        }
        $pending = $this->otpService->getRegistrationPending($email);
        if ($pending === null) {
            return response()->json(['message' => 'Registration session expired. Please start again.'], 422);
        }
        $this->otpService->forgetRegistrationOtp($email);
        $this->otpService->forgetRegistrationPending($email);
        $now = new \DateTimeImmutable;
        $user = $this->userRepository->create(
            $email,
            $pending['password'],
            $now,
            $now,
        );
        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
        ], 201);
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
            'address_line1' => $user->address_line1,
            'address_city' => $user->address_city,
            'address_postcode' => $user->address_postcode,
            'address_country' => $user->address_country,
        ]);
    }
}
