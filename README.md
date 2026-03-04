# SmallShopPay – Monorepo

Stripe Tap to Pay (UK) platform for small shops. Web onboarding + mobile payments.

## Structure

```
small-shop-pay/
├── backend/    # Laravel API
├── web/        # React SPA (onboarding)
├── mobile/     # React Native (Tap to Pay)
└── docs/       # Shared documentation
```

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL/SQLite (backend)
- React Native toolchain (mobile)

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Web (Phase 1+)

```bash
cd web
npm install
npm run dev
```

### Mobile (Phase 1+)

```bash
cd mobile
npm install
npx expo start  # or react-native run-ios / run-android
```

## Development Plan

See `.cursor/plans/` for the full specification and step-by-step guide.
