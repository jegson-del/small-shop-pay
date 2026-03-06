import { api } from './client';

export type PaymentItem = {
  id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string | null;
};

export type PaymentsResponse = {
  data: PaymentItem[];
};

export async function getPayments(): Promise<PaymentItem[]> {
  const res = await api.get<PaymentsResponse>('/payments');
  return res?.data ?? [];
}
