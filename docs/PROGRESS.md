# SmallShopPay – Progress summary

Last updated: March 2025

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

### Web dashboard
- Dashboard: Connect Stripe, Start Free Trial, Download App
- Progress bar and trial status
- Subscription success page (`/subscription-success`)
- Settings page (`/settings`): Payment & subscription (Stripe Billing Portal), placeholder for Terminal & reader
- Auth layout: header nav (Dashboard, Settings) with active state, footer (Terms, Privacy, Support)

### Legal pages
- Terms & Conditions (`/terms`) – structured content
- Privacy Policy (`/privacy`) – placeholder for future content

### Documentation
- [docs/STRIPE_WEBHOOKS.md](STRIPE_WEBHOOKS.md) – webhook setup
- [docs/DEVELOPMENT.md](DEVELOPMENT.md) – setup and troubleshooting

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
| POST | `/api/webhooks/stripe` | Signed | Stripe webhooks |

## Planned / placeholder
- Terminal & reader settings (terminal ID, reader, location) – UI placeholder in Settings
- Privacy Policy full content
- Mobile app integration
