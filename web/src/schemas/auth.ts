import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  stripe_account_id: z.string().nullable(),
  charges_enabled: z.boolean().nullable(),
  payouts_enabled: z.boolean().nullable(),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});

export const registerResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
