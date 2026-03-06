<?php

namespace App\Providers;

use App\Application\Contracts\Auth\AccessTokenServiceInterface;
use App\Application\Contracts\Auth\PasswordHasherInterface;
use App\Application\Contracts\Auth\RefreshTokenRepositoryInterface;
use App\Application\Contracts\StripeConnect\StripeConnectAdapterInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use App\Application\UseCases\StripeConnect\CreateStripeConnectAccountUseCase;
use App\Application\UseCases\StripeConnect\GetStripeConnectAccountLinkUseCase;
use App\Application\UseCases\StripeConnect\GetStripeConnectStatusUseCase;
use App\Application\UseCases\Subscription\CreateSubscriptionCheckoutUseCase;
use App\Infrastructure\Auth\BcryptPasswordHasher;
use App\Infrastructure\Auth\SanctumAccessTokenService;
use App\Infrastructure\Persistence\EloquentRefreshTokenRepository;
use App\Infrastructure\Persistence\EloquentUserRepository;
use App\Infrastructure\Stripe\StripeConnectAdapter;
use Illuminate\Support\ServiceProvider;
use Stripe\StripeClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(PasswordHasherInterface::class, BcryptPasswordHasher::class);
        $this->app->bind(RefreshTokenRepositoryInterface::class, EloquentRefreshTokenRepository::class);
        $this->app->bind(AccessTokenServiceInterface::class, SanctumAccessTokenService::class);

        $this->app->singleton(StripeClient::class, function () {
            $key = config('stripe.secret_key') ?? 'sk_test_placeholder';
            return new StripeClient($key);
        });

        $this->app->bind(StripeConnectAdapterInterface::class, function ($app) {
            return new StripeConnectAdapter(
                $app->make(StripeClient::class),
                config('stripe.connect.country', 'GB'),
            );
        });

        $this->app->bind(GetStripeConnectAccountLinkUseCase::class, function ($app) {
            return new GetStripeConnectAccountLinkUseCase(
                $app->make(UserRepositoryInterface::class),
                $app->make(StripeConnectAdapterInterface::class),
                config('stripe.return_url'),
                config('stripe.refresh_url'),
            );
        });

        $this->app->bind(CreateSubscriptionCheckoutUseCase::class, function ($app) {
            $sub = config('stripe.subscription');
            return new CreateSubscriptionCheckoutUseCase(
                $app->make(UserRepositoryInterface::class),
                $app->make(StripeClient::class),
                $sub['price_amount'],
                $sub['trial_days'],
                $sub['success_url'],
                $sub['cancel_url'],
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
