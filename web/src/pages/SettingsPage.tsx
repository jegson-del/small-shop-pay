import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMeQuery } from '@/hooks/useAuth';
import { api } from '@/api/client';

function useBillingPortalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ url: string }>('/stripe/billing-portal');
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (data?.url) window.location.href = data.url;
    },
  });
}

export function SettingsPage() {
  const { data: user, isLoading: userLoading } = useMeQuery();
  const billingPortalMutation = useBillingPortalMutation();
  const hasSubscription = Boolean(user?.stripe_customer_id);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-600">Manage your account and payment details.</p>
      </div>

      {/* Payment & subscription */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Payment & subscription</h2>
        <p className="mt-1 text-sm text-slate-600">
          Update your card, view invoices, or cancel your subscription.
        </p>
        {hasSubscription ? (
          <button
            onClick={() => billingPortalMutation.mutate()}
            disabled={billingPortalMutation.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-70"
          >
            {billingPortalMutation.isPending ? 'Opening…' : 'Manage billing & card'}
          </button>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Start your free trial first to manage payment details.</p>
        )}
      </section>

      {/* Terminal & reader (placeholder for future) */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm opacity-75">
        <h2 className="text-lg font-semibold text-slate-900">Terminal & reader</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage terminal ID, reader, and location. Coming soon.
        </p>
        <p className="mt-4 text-sm text-slate-500 italic">This section will be available in a future update.</p>
      </section>
    </div>
  );
}
