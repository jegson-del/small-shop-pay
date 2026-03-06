import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMeQuery } from '@/hooks/useAuth';

export function SubscriptionSuccessPage() {
  const { data: user, refetch } = useMeQuery();
  const isActive = user?.subscription_status === 'active' || user?.subscription_status === 'trialing';

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="max-w-lg mx-auto py-12 px-4 text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">You&apos;re all set</h1>
      <p className="mt-3 text-slate-600">
        {isActive
          ? 'Your subscription is active. You can now use the SmallShopPay app to accept payments.'
          : 'Your subscription is being set up. This may take a moment.'}
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white hover:opacity-90"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
