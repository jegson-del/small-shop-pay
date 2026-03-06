# SmallShopPay – Implementation roadmap

Last updated: March 2026

## Overview

This document outlines what’s next in the implementation and how to move forward. See [PROGRESS.md](PROGRESS.md) for a summary of completed work.

---

## Immediate next steps

### 1. Tap to Pay testing (release APK)

Tap to Pay only works on **non-debuggable (release) builds** on supported devices. Debug builds fail with “Device does not use Trusted Execution Environment” or `TAP_TO_PAY_DEBUG_NOT_SUPPORTED`.

**Build release APK:**

```bash
cd mobile/android
./gradlew assembleRelease
```

APK output: `mobile/android/app/build/outputs/apk/release/app-release.apk`

**Install on device:**
- Copy APK to phone (USB, cloud, etc.)
- Or: `adb install -r mobile/android/app/build/outputs/apk/release/app-release.apk`

**Supported devices (examples):** Samsung Galaxy S9–S23, Google Pixel 2–7, and others meeting Stripe’s requirements (NFC, TEE, hardware keystore).

---

## Phase 4 – Polish

| Item | Description |
|------|-------------|
| Error handling | Consistent error messages, retry behavior, offline handling |
| Accessibility | Screen reader labels, contrast, focus order |
| CI | Automated tests, lint, build checks |
| Production config | Environment configs, secrets, deployment |
| Docs | Update STRIPE_WEBHOOKS.md, MOBILE_DEVICE_SETUP.md if needed |

---

## Optional follow-ups

| Item | Notes |
|------|-------|
| Phase 1 E2E smoke test | Optional end-to-end test for auth and core flows |
| Feature tests | `GET /api/payments`, `EnsureMerchantCanAcceptPayments` (403 when subscription expired) |
| Privacy Policy | Fill placeholder content for `/privacy` |
| Dev-only UI | Remove or gate “API: …” line on Login screen for production |

---

## Architecture quick reference

- **Backend:** Laravel, Sanctum auth, Stripe Connect + subscription + Terminal
- **Web:** React SPA (Vite), Dashboard + Settings + Stripe flows
- **Mobile:** React Native (Expo), Stripe Terminal SDK for Tap to Pay
- **Key env:** `FRONTEND_URL` (backend redirects), `EXPO_PUBLIC_API_URL` (mobile)
