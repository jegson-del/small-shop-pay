import { api } from './client';

export type ConnectStatus = {
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
};

export type SubscriptionCheckoutResponse = {
  url: string;
  session_id: string;
};

/** Get Stripe Connect account status */
export async function getConnectStatus(): Promise<ConnectStatus> {
  return api.get<ConnectStatus>('/stripe/connect/status');
}

/** Create subscription checkout session – returns Stripe Checkout URL */
export async function createSubscriptionCheckout(): Promise<SubscriptionCheckoutResponse> {
  return api.post<SubscriptionCheckoutResponse>('/stripe/subscription/checkout');
}
