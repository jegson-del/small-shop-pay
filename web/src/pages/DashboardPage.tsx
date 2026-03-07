import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useMeQuery } from '@/hooks/useAuth';
import { getConnectStatus, createSubscriptionCheckout } from '@/api/stripe';
import { updateAddress } from '@/api/profile';
import { api } from '@/api/client';

const connectStatusKey = ['stripe', 'connect-status'] as const;

function useConnectStatus(enabled: boolean) {
  return useQuery({
    queryKey: connectStatusKey,
    queryFn: getConnectStatus,
    enabled,
  });
}

function useConnectAccountMutation() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ url: string }>('/stripe/connect/account');
      return res;
    },
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
  });
}

function useSubscriptionCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubscriptionCheckout,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (data.url) window.location.href = data.url;
    },
  });
}

function hasAddressComplete(user: { address_line1?: string | null; address_city?: string | null; address_postcode?: string | null; address_country?: string | null } | null): boolean {
  if (!user) return false;
  return Boolean(
    user.address_line1?.trim() &&
    user.address_city?.trim() &&
    user.address_postcode?.trim() &&
    user.address_country?.trim()
  );
}

function formatTrialDays(trialEnd: string | null | undefined): number | null {
  if (!trialEnd) return null;
  const end = new Date(trialEnd);
  const now = new Date();
  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

const inputBase =
  'w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const stripeReturn = searchParams.get('stripe') === 'return';
  const statusCheckFailed = searchParams.get('error') === 'status_check_failed';
  const showVerificationBanner = stripeReturn && statusCheckFailed;

  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useMeQuery();
  const hasStripeAccount = Boolean(user?.stripe_account_id);
  const { data: connectStatus, isLoading: connectLoading } = useConnectStatus(hasStripeAccount);
  const connectComplete = connectStatus?.charges_enabled && connectStatus?.payouts_enabled;
  const subscriptionActive = user?.subscription_status === 'active' || user?.subscription_status === 'trialing';
  const addressComplete = hasAddressComplete(user);
  const canConnectStripe = addressComplete;
  const canStartTrial = connectComplete && !subscriptionActive;
  const trialDays = formatTrialDays(user?.trial_end);
  const connectMutation = useConnectAccountMutation();
  const checkoutMutation = useSubscriptionCheckoutMutation();

  const [addressForm, setAddressForm] = useState({
    address_line1: '',
    address_city: '',
    address_postcode: '',
    address_country: 'GB',
  });

  useEffect(() => {
    if (user) {
      setAddressForm({
        address_line1: user.address_line1 ?? '',
        address_city: user.address_city ?? '',
        address_postcode: user.address_postcode ?? '',
        address_country: user.address_country ?? 'GB',
      });
    }
  }, [user?.address_line1, user?.address_city, user?.address_postcode, user?.address_country]);

  const addressMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const handleConnect = () => connectMutation.mutate();
  const handleStartTrial = () => checkoutMutation.mutate();
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addressMutation.mutate(addressForm);
  };

  const stepsComplete = [addressComplete, connectComplete, subscriptionActive, user?.app_access].filter(Boolean).length;
  const totalSteps = 4;

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Onboarding incomplete: verification required (e.g. identity upload) */}
      {showVerificationBanner && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm" role="alert">
          <h2 className="font-semibold text-amber-900">Onboarding not complete</h2>
          <p className="mt-1 text-sm text-amber-800">
            We need to verify your identity to finish connecting your Stripe account. Please click{' '}
            <strong>Complete onboarding</strong> below to continue to Stripe’s verification (e.g. upload your ID).
            You may need to log in first if you were redirected here from Stripe.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Welcome back{user?.email ? `, ${user.email}` : ''}. Complete the steps below to start accepting payments.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(stepsComplete / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-600">{stepsComplete} of {totalSteps} complete</span>
        </div>
      </div>

      {/* Step 1: Business address */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              addressComplete ? 'bg-success text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {addressComplete ? '✓' : '1'}
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">Business address</h2>
            <p className="mt-1 text-sm text-slate-600">
              Required for payment processing. We use this when connecting your Stripe account.
            </p>
            {addressComplete ? (
              <div className="mt-3 rounded-lg bg-success/10 border border-success/20 px-4 py-2.5">
                <p className="text-sm font-medium text-success">✓ Address saved</p>
                <p className="mt-1 text-xs text-slate-600">
                  {user?.address_line1}, {user?.address_city} {user?.address_postcode}, {user?.address_country}
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddressSubmit} className="mt-3 space-y-3">
                <input
                  type="text"
                  placeholder="Address line 1"
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm((p) => ({ ...p, address_line1: e.target.value }))}
                  className={inputBase}
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.address_city}
                  onChange={(e) => setAddressForm((p) => ({ ...p, address_city: e.target.value }))}
                  className={inputBase}
                  required
                />
                <input
                  type="text"
                  placeholder="Postcode"
                  value={addressForm.address_postcode}
                  onChange={(e) => setAddressForm((p) => ({ ...p, address_postcode: e.target.value }))}
                  className={inputBase}
                  required
                />
                <input
                  type="text"
                  placeholder="Country (e.g. GB)"
                  value={addressForm.address_country}
                  onChange={(e) => setAddressForm((p) => ({ ...p, address_country: e.target.value }))}
                  className={inputBase}
                  maxLength={2}
                  required
                />
                {addressMutation.isError && (
                  <p className="text-sm text-red-600">{addressMutation.error?.message ?? 'Failed to save address'}</p>
                )}
                <button
                  type="submit"
                  disabled={addressMutation.isPending}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-70"
                >
                  {addressMutation.isPending ? 'Saving…' : 'Save address'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Step 2: Connect with Stripe */}
      <section className={`rounded-xl border p-6 shadow-sm transition-shadow duration-300 ${
        canConnectStripe ? 'border-slate-200 bg-white hover:shadow-md' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="flex items-start gap-4">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              connectComplete ? 'bg-success text-white' : canConnectStripe ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {connectComplete ? '✓' : '2'}
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">Connect with Stripe</h2>
            <p className="mt-1 text-sm text-slate-600">
              Connect your Stripe account to receive payouts from your customers.
            </p>
            {!canConnectStripe ? (
              <p className="mt-3 text-sm text-slate-500">Complete Step 1 (address) first.</p>
            ) : !hasStripeAccount ? (
              <button
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#635bff] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5149e6] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {connectMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
                    Connecting…
                  </>
                ) : (
                  'Connect with Stripe'
                )}
              </button>
            ) : connectLoading ? (
              <p className="mt-3 text-sm text-slate-500">Checking status…</p>
            ) : connectComplete ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-sm font-medium text-success">✓ Connected</p>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {connectMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" aria-hidden />
                    Redirecting…
                  </>
                ) : (
                  'Complete onboarding'
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Step 3: Start Free Trial */}
      <section className={`rounded-xl border p-6 shadow-sm transition-shadow duration-300 ${
        connectComplete ? 'border-slate-200 bg-white hover:shadow-md' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="flex items-start gap-4">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              subscriptionActive ? 'bg-success text-white' : connectComplete ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {subscriptionActive ? '✓' : '3'}
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">Start your free trial</h2>
            <p className="mt-1 text-sm text-slate-600">
              14-day free trial. £9/month after trial. Cancel anytime.
            </p>
            {subscriptionActive ? (
              <div className="mt-3 rounded-lg bg-success/10 border border-success/20 px-4 py-2.5">
                <p className="text-sm font-medium text-success">
                  {user?.subscription_status === 'trialing' && trialDays !== null
                    ? `✓ Trial active – ${trialDays} days remaining`
                    : '✓ Subscription active'}
                </p>
                {user?.subscription_status === 'trialing' && (
                  <p className="mt-1 text-xs text-slate-500">
                    Stripe will charge £9/month after your trial ends. Cancel anytime.
                  </p>
                )}
              </div>
            ) : !connectComplete ? (
              <p className="mt-3 text-sm text-slate-500">Complete Step 2 (Connect with Stripe) first.</p>
            ) : canStartTrial ? (
              <button
                onClick={handleStartTrial}
                disabled={checkoutMutation.isPending}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-70 transition-opacity"
              >
                {checkoutMutation.isPending ? 'Redirecting…' : 'Start Free Trial'}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Step 4: Download App */}
      <section className={`rounded-xl border p-6 shadow-sm transition-shadow duration-300 ${
        subscriptionActive ? 'border-slate-200 bg-white hover:shadow-md' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="flex items-start gap-4">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              user?.app_access ? 'bg-success text-white' : subscriptionActive ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {user?.app_access ? '✓' : '4'}
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">Download the app</h2>
            <p className="mt-1 text-sm text-slate-600">
              Install the SmallShopPay app on your phone to accept contactless payments.
            </p>
            {user?.app_access ? (
              <div className="mt-3 flex flex-wrap gap-4">
                <a
                  href="https://apps.apple.com/app/smallshoppay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md transition-all duration-200"
                >
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt=""
                    className="h-8 w-auto object-contain"
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-slate-700">Click to download from App Store</span>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.smallshoppay.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md transition-all duration-200"
                >
                  <img
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt=""
                    className="h-8 w-auto object-contain"
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-slate-700">Click to download from Google Play</span>
                </a>
              </div>
            ) : !subscriptionActive ? (
              <p className="mt-3 text-sm text-slate-500">Complete Step 3 (Start free trial) first.</p>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Start your free trial to unlock the app.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
