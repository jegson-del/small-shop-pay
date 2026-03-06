<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * List payments for the authenticated user.
 * Sub-7: Allowed even when subscription expired (view transactions).
 */
final class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $payments = $user->payments()
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'stripe_payment_intent_id', 'amount', 'currency', 'status', 'created_at']);

        $data = $payments->map(fn ($p) => [
            'id' => $p->id,
            'stripe_payment_intent_id' => $p->stripe_payment_intent_id,
            'amount' => $p->amount,
            'currency' => $p->currency,
            'status' => $p->status,
            'created_at' => $p->created_at?->format('c'),
        ]);

        return response()->json(['data' => $data]);
    }
}
