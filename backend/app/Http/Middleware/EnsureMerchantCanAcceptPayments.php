<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sub-7: Block new payments when subscription expired.
 * Allow login and view transactions; block creating PaymentIntent / connection token.
 */
final class EnsureMerchantCanAcceptPayments
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $status = $user->subscription_status ?? 'none';
        $appAccess = (bool) ($user->app_access ?? false);
        $allowed = in_array($status, ['active', 'trialing'], true) && $appAccess;

        if (!$allowed) {
            return response()->json([
                'message' => 'Subscription required. Please activate your account or renew your subscription in the SmallShopPay dashboard.',
            ], 403);
        }

        return $next($request);
    }
}
