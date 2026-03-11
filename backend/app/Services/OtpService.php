<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class OtpService
{
    private const OTP_LENGTH = 6;
    private const OTP_TTL_MINUTES = 10;
    private const RESET_TOKEN_TTL_MINUTES = 15;

    public function generate(): string
    {
        $min = (int) str_pad('1', self::OTP_LENGTH, '0');
        $max = (int) str_repeat('9', self::OTP_LENGTH);
        return (string) random_int($min, $max);
    }

    public function storeForgotPassword(string $email): string
    {
        $otp = $this->generate();
        Cache::put('otp:forgot:' . $email, $otp, now()->addMinutes(self::OTP_TTL_MINUTES));
        return $otp;
    }

    public function verifyForgotPassword(string $email, string $otp): bool
    {
        $stored = Cache::get('otp:forgot:' . $email);
        if ($stored === null || $stored !== $otp) {
            return false;
        }
        Cache::forget('otp:forgot:' . $email);
        return true;
    }

    public function createResetToken(string $email): string
    {
        $token = Str::random(64);
        Cache::put('reset_token:' . $token, $email, now()->addMinutes(self::RESET_TOKEN_TTL_MINUTES));
        return $token;
    }

    public function verifyResetToken(string $token): ?string
    {
        $email = Cache::get('reset_token:' . $token);
        if ($email === null) {
            return null;
        }
        Cache::forget('reset_token:' . $token);
        return $email;
    }

    public function storeRegistration(string $email): string
    {
        $otp = $this->generate();
        Cache::put('otp:registration:' . $email, $otp, now()->addMinutes(self::OTP_TTL_MINUTES));
        return $otp;
    }

    public function verifyRegistration(string $email, string $otp): bool
    {
        $stored = Cache::get('otp:registration:' . $email);
        return $stored !== null && $stored === $otp;
    }

    public function forgetRegistrationOtp(string $email): void
    {
        Cache::forget('otp:registration:' . $email);
    }

    public function putRegistrationPending(string $email, array $data): void
    {
        Cache::put('registration_pending:' . $email, $data, now()->addMinutes(self::OTP_TTL_MINUTES));
    }

    public function getRegistrationPending(string $email): ?array
    {
        return Cache::get('registration_pending:' . $email);
    }

    public function forgetRegistrationPending(string $email): void
    {
        Cache::forget('registration_pending:' . $email);
    }
}
