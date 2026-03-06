import { api } from './client';

export type ConnectionTokenResponse = {
  secret: string;
};

export type CreatePaymentIntentResponse = {
  client_secret: string;
  payment_intent_id: string;
};

export async function getConnectionToken(): Promise<string> {
  const res = await api.post<ConnectionTokenResponse>('/terminal/connection_token');
  if (!res?.secret) throw new Error('No connection token');
  return res.secret;
}

export async function createPaymentIntent(amountPence: number, currency = 'gbp'): Promise<CreatePaymentIntentResponse> {
  const res = await api.post<CreatePaymentIntentResponse>('/terminal/payment_intent', {
    amount: amountPence,
    currency,
  });
  if (!res?.client_secret) throw new Error('Failed to create payment');
  return res;
}
