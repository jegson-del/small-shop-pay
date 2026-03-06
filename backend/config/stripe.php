<?php

return [

    'secret_key' => env('STRIPE_SECRET_KEY'),

    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

    'return_url' => env('STRIPE_RETURN_URL', env('APP_URL') . '/api/stripe/return'),

    'refresh_url' => env('STRIPE_REFRESH_URL', env('APP_URL') . '/api/stripe/refresh'),

    'connect' => [
        'country' => env('STRIPE_CONNECT_COUNTRY', 'GB'),
    ],

    'subscription' => [
        'price_amount' => (int) env('STRIPE_SUBSCRIPTION_PRICE_PENCE', 900), // £9
        'trial_days' => (int) env('STRIPE_SUBSCRIPTION_TRIAL_DAYS', 14),
        'success_url' => env('STRIPE_SUBSCRIPTION_SUCCESS_URL', env('FRONTEND_URL', env('APP_URL')) . '/subscription-success'),
        'cancel_url' => env('STRIPE_SUBSCRIPTION_CANCEL_URL', env('FRONTEND_URL', env('APP_URL')) . '/dashboard'),
    ],

    'billing_portal' => [
        'return_url' => env('STRIPE_BILLING_PORTAL_RETURN_URL', env('FRONTEND_URL', env('APP_URL')) . '/settings'),
    ],

];
