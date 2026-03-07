import { z } from 'zod';

export const loginInputSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    email_confirmation: z.string().min(1, 'Please confirm your email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
    terms_accepted: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms and Conditions',
    }),
    privacy_accepted: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Privacy Policy',
    }),
  })
  .refine((data) => data.email === data.email_confirmation, {
    message: 'Emails do not match',
    path: ['email_confirmation'],
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const userSchema = z.object({
  id: z.union([z.number(), z.string()]),
  email: z.string().email(),
  stripe_account_id: z.string().nullable(),
  stripe_customer_id: z.string().nullable().optional(),
  charges_enabled: z.boolean().nullable(),
  payouts_enabled: z.boolean().nullable(),
  subscription_status: z.string().optional().default('none'),
  app_access: z.boolean().optional().default(false),
  trial_end: z.string().nullable().optional(),
  address_line1: z.string().nullable().optional(),
  address_city: z.string().nullable().optional(),
  address_postcode: z.string().nullable().optional(),
  address_country: z.string().nullable().optional(),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});

export const registerResponseSchema = z.object({
  id: z.union([z.number(), z.string()]),
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
