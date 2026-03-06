<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MerchantStatusController;
use App\Http\Controllers\Api\StripeConnectController;
use App\Http\Controllers\Api\StripeReturnController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::post('webhooks/stripe', [StripeWebhookController::class, 'handle']);

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::prefix('stripe')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('connect/account', [StripeConnectController::class, 'createAccount']);
        Route::get('connect/status', [StripeConnectController::class, 'status']);
        Route::post('subscription/checkout', [SubscriptionController::class, 'checkout']);
        Route::post('billing-portal', [SubscriptionController::class, 'billingPortal']);
    });
    Route::get('return', [StripeReturnController::class, 'returnToDashboard']);
    Route::get('refresh', [StripeReturnController::class, 'refresh']);
});

Route::get('merchant/status', [MerchantStatusController::class, 'status'])->middleware('auth:sanctum');
