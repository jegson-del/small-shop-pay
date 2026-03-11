<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\ContactRequest;
use App\Mail\ContactFormMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function contactus(ContactRequest $request): JsonResponse
    {
        $validated = $request->validated();

        Mail::to('support@3ttechgroup.com')->send(new ContactFormMail(
            fromName: $validated['name'],
            fromEmail: $validated['email'],
            messageBody: $validated['message'],
        ));

        return response()->json(['message' => 'Message sent successfully.']);
    }
}
