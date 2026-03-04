import { z } from 'zod';

export const loginInputSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
    terms_accepted: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms and Conditions',
    }),
    privacy_accepted: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export type RegisterInput = z.infer<typeof registerInputSchema>;

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
