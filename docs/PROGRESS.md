# SmallShopPay – Progress summary

Last updated: March 2026

## Completed features

### Authentication
- Register, login, logout, token refresh
- Protected routes with auth check
- `auth/me` returns user profile including `stripe_account_id`, `stripe_customer_id`, `subscription_status`, `app_access`, `trial_end`

### Stripe Connect
- Connect onboarding (create account, Account Link)
- Endpoints: `POST /api/stripe/connect/account`, `GET /api/stripe/connect/status`
- Return/refresh URLs for OAuth flow

### Subscription flow
- `POST /api/stripe/subscription/checkout` – Stripe Checkout (14-day trial, £9/month)
- Webhooks: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`
- Subscription status and `app_access` managed via webhooks

### Billing portal
- `POST /api/stripe/billing-portal` – creates Stripe Billing Portal session for managing card and subscription
- Requires `stripe_customer_id` (user must have completed Checkout)
- Redirects back to `/settings`

### Subscription expiry (sub-7)
- Middleware `EnsureMerchantCanAcceptPayments`: blocks new payments when subscription expired/canceled; applied to Terminal routes
- `GET /api/payments` – list payments for authenticated user (allowed when expired – view transactions)
- Payment model, User→payments relation

### Phase 3 – Terminal & Payments
- **Backend:** `GET /api/terminal/config` (returns `location_id` for Tap to Pay), `POST /api/terminal/connection_token` (connection token + location_id), `POST /api/terminal/payment_intent` (create PaymentIntent; creates pending Payment record)
- **Terminal Location:** One per merchant, auto-created when Connect onboarding completes or lazily on first Terminal use
- **Capabilities:** Connect accounts request `card_payments` and `transfers` at creation
- **Gating:** Terminal requires `charges_enabled` and `payouts_enabled` on Connect account
- **Webhooks:** `payment_intent.succeeded` and `payment_intent.payment_failed` update Payment status (or create Payment if missing)
- **Mobile:** Take Payment screen – amount input (GBP), create PaymentIntent via API, “Ready to collect” state; Tap to Pay collection via Stripe Terminal SDK can be added in a development build

### Web dashboard
- Dashboard: Connect Stripe, Start Free Trial, Download App
- Progress bar and trial status
- Subscription success page (`/subscription-success`)
- Settings page (`/settings`): Payment & subscription (Stripe Billing Portal), placeholder for Terminal & reader
- Auth layout: header nav (Dashboard, Settings) with active state, footer (Terms, Privacy, Support)

### Legal pages
- Terms & Conditions (`/terms`) – structured content; section 4 states £9/month, 14-day free trial, cancel anytime
- Privacy Policy (`/privacy`) – placeholder for future content
- Pricing & T&Cs at registration: £9/mo and trial stated on Register page and landing Pricing section; terms and privacy acceptance required (backend + web validated; tests for 422 when not accepted)

### Mobile app
- **Stack:** React Native (Expo), TypeScript, React Navigation (native-stack)
- **Auth:** Login screen (modern minimal UI), token refresh, secure storage via `expo-secure-store` (Expo Go–compatible)
- **Navigation:** Login ↔ Home by auth state; header shows “Hi, {name}” and “Log out” (top-right)
- **Home (dashboard):** Welcome card, Take Payment CTA (navigates to Take Payment screen), Recent payments (from `GET /api/payments`), pull-to-refresh, activate-account card when no subscription
- **Take Payment screen:** Enter amount (GBP), Charge creates PaymentIntent via API; ready state for Tap to Pay (Terminal SDK integration in dev build for full flow)
- **Biometric unlock (1.22):** When authenticated and device has Face ID / Touch ID (or fingerprint) enrolled, app requires biometric to unlock on open and when returning from background; lock screen with “Unlock” and “Log out”; no lock when biometric not available (e.g. Expo Go)
- **Subscription gating (sub-6):** Take Payment only when `subscription_status` is active/trialing or `app_access` true; otherwise “Activate your account” prompt
- **Config:** `EXPO_PUBLIC_API_URL` in `mobile/.env` for device (e.g. `http://<PC_IP>:8000/api`)

### Documentation
- [docs/STRIPE_WEBHOOKS.md](STRIPE_WEBHOOKS.md) – webhook setup
- [docs/MOBILE_DEVICE_SETUP.md](MOBILE_DEVICE_SETUP.md) – device testing (Laragon, firewall, tunnel)
- [docs/PROGRESS.md](PROGRESS.md) – this file (plan mapping below)

---

## API routes summary

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh token |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/stripe/connect/account` | Yes | Create Connect account |
| GET | `/api/stripe/connect/status` | Yes | Connect status |
| POST | `/api/stripe/subscription/checkout` | Yes | Start subscription |
| POST | `/api/stripe/billing-portal` | Yes | Billing Portal URL |
| GET | `/api/merchant/status` | Yes | Mobile access check |
| GET | `/api/payments` | Yes | List user payments (allowed when subscription expired) |
| GET | `/api/terminal/config` | Yes + merchant | Terminal location_id for Tap to Pay |
| POST | `/api/terminal/connection_token` | Yes + merchant | Connection token + location_id |
| POST | `/api/terminal/payment_intent` | Yes + merchant | Create PaymentIntent for Tap to Pay |
| POST | `/api/webhooks/stripe` | Signed | Stripe webhooks |

---

## Plan mapping – what’s done vs what’s left

### Top-level todos (from plan)

| ID | Description | Status |
|----|-------------|--------|
| sub-1 | Subscription DB fields | Done |
| sub-2 | Stripe Checkout subscription flow (14-day trial) | Done |
| sub-3 | Subscription webhooks | Done |
| sub-4 | GET /merchant/status | Done |
| sub-5 | Web dashboard – Start Free Trial, subscription status | Done |
| sub-6 | Mobile – gate payments by subscription_status | Done |
| sub-7 | Subscription expiry (login + view transactions, block new payments) | Done |
| sub-8 | Pricing & T&Cs – £9/mo, trial, enforce at registration | Done |

### Step-by-step (Phases 1–4)

| Phase | Steps | Status |
|-------|--------|--------|
| **1 – Foundation & Auth** | 1.1–1.20 (backend, web auth, mobile API/keychain/AuthContext) | Done |
| | 1.21 – Mobile: Navigation & Login screen | Done |
| | 1.22 – Mobile: Biometric unlock flow | Done |
| | 1.23 – Mobile: Home placeholder | Done (dashboard with list + CTA) |
| | 1.24 – Phase 1 E2E smoke test | **Left** (optional) |
| **2 – Stripe Connect** | 2.1–2.16 (Connect, dashboard, subscription, merchant status) | Done |
| **3 – Terminal & Payments** | 3.1–3.16 (ConnectionToken, PaymentIntent, webhooks, Take Payment UI) | Done (Tap to Pay SDK in dev build for full collect) |
| **4 – Polish** | 4.1–4.10 (error handling, a11y, CI, production, docs) | **Left** |

### What’s left (concise)

1. **Step 1.24** – Phase 1 E2E (optional).
2. **Phase 3 – Tap to Pay testing:** Use a **release APK** (non-debuggable build) on a supported device (e.g. Samsung S20) to test full Tap to Pay flow – debug builds are blocked by Stripe for security. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for build steps.
3. **Phase 4** – Polish (errors, a11y, CI, production config, docs).

---

## Review of work so far

### Strengths
- **Architecture:** Backend follows plan (domain, use cases, infrastructure). Auth and subscription flows are clear; subscription gating and expiry (sub-6, sub-7) are implemented in both API and mobile.
- **TypeScript:** Web and mobile use TypeScript; types and schemas (e.g. auth, user, payments) are in place.
- **Tests:** Backend has unit tests for auth use cases and domain (`User::canAcceptPayments`), plus feature tests for auth, Stripe Connect, and subscription. Gaps: no tests yet for `GET /api/payments` or the `EnsureMerchantCanAcceptPayments` middleware.
- **Mobile UX:** Login and Home are aligned with the design system (colors, typography). Take Payment is above the payments list; gradient CTA and header (user name + logout) improve usability.
- **Config & docs:** Mobile API URL via `.env`, device setup doc (Laragon, firewall, tunnel) and PROGRESS.md give a clear map of done vs remaining.

### Possible improvements (non-blocking)
- Add feature tests for `GET /api/payments` and for the subscription middleware (403 when expired).
- When Phase 3 is added, protect terminal endpoints with `merchant.can_accept_payments` and add webhook + PaymentIntent tests.
- Consider removing or gating the dev-only “API: …” line on the Login screen for production builds.
- Privacy Policy content is still placeholder; sub-8 / legal can fill that.

### Summary
Foundation (auth, Connect, subscription, subscription gating and expiry) is in place for web and mobile. Pricing and T&Cs (sub-8) are enforced at registration. Phase 3 (Terminal & Payments) is in place: connection token and PaymentIntent endpoints, webhooks for payment_intent.succeeded/failed, Take Payment screen with Tap to Pay via Stripe Terminal SDK. **Tap to Pay must be tested with a release APK** on a supported device (e.g. Samsung S20) – debug builds are blocked. Next: validate Tap to Pay on device, then Phase 4 (polish).

---

## What’s next

| Priority | Item | Notes |
|----------|------|-------|
| 1 | **Test Tap to Pay with release APK** | Build `assembleRelease`, install on Samsung S20 (or other supported device). Debug builds fail with TEE/attestation errors. |
| 2 | **Phase 4 – Polish** | Error handling, a11y, CI, production config, final docs. |
| 3 | **Optional** | Phase 1 E2E smoke test; feature tests for `GET /api/payments` and subscription middleware. |
