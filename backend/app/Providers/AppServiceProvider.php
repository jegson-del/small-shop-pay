<?php

namespace App\Providers;

use App\Application\Contracts\Auth\AccessTokenServiceInterface;
use App\Application\Contracts\Auth\PasswordHasherInterface;
use App\Application\Contracts\Auth\RefreshTokenRepositoryInterface;
use App\Application\Contracts\User\UserRepositoryInterface;
use App\Infrastructure\Auth\BcryptPasswordHasher;
use App\Infrastructure\Auth\SanctumAccessTokenService;
use App\Infrastructure\Persistence\EloquentRefreshTokenRepository;
use App\Infrastructure\Persistence\EloquentUserRepository;
use Illuminate\Support\ServiceProvider;

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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
