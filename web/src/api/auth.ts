import { api, API_BASE } from './client';
import { tokenStore } from './tokenStore';
import {
  userSchema,
  loginResponseSchema,
  registerResponseSchema,
  type User,
  type LoginResponse,
  type RegisterResponse,
} from '@/schemas/auth';

async function parseJsonOrThrow(res: Response, fallbackMessage: string): Promise<unknown> {
  const text = await res.text();
  if (!text) {
    throw new Error(`${fallbackMessage} (API returned empty response – check backend is running on port 8000 and Vite proxy target)`);
  }
  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.length > 120 ? text.slice(0, 120) + '…' : text;
    const looksLikeHtml = /^\s*</.test(text.trim());
    const hint = looksLikeHtml
      ? ' – Response looks like HTML. Ensure Laravel backend is running (php artisan serve) and Vite proxy target is http://localhost:8000'
      : ` – Response: "${snippet.replace(/"/g, "'")}"`;
    throw new Error(`${fallbackMessage} (API returned invalid JSON – status ${res.status}${hint})`);
  }
}

/** Login – returns tokens; caller should update tokenStore and invalidate queries */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = (await parseJsonOrThrow(res, 'Login failed')) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data?.message as string) ?? 'Login failed');
  }

  return loginResponseSchema.parse(data);
}

/** Register – does not return tokens; user must login after */
export async function register(params: {
  email: string;
  email_confirmation: string;
  password: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(params),
  });

  const data = (await parseJsonOrThrow(res, 'Registration failed')) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(data?.message ?? 'Registration failed');
  }

  return registerResponseSchema.parse(data);
}

/** Refresh – used internally by client; exported for explicit refresh if needed */
export async function refresh(): Promise<LoginResponse> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = (await parseJsonOrThrow(res, 'Token refresh failed')) as Record<string, unknown>;
  if (!res.ok) {
    tokenStore.clear();
    throw new Error(data?.message ?? 'Refresh failed');
  }

  return loginResponseSchema.parse(data);
}

/** Logout – revokes refresh token */
export async function logout(): Promise<void> {
  const refreshToken = tokenStore.getRefreshToken();
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refresh_token: refreshToken }, { skipAuth: true });
    } finally {
      tokenStore.clear();
    }
  } else {
    tokenStore.clear();
  }
}

/** Get current user – requires valid access token */
export async function getMe(): Promise<User> {
  const data = await api.get<unknown>('/auth/me');
  return userSchema.parse(data);
}

/** Forgot password – send OTP to email */
export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = (await parseJsonOrThrow(res, 'Failed to send OTP')) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data?.message as string) ?? 'Failed to send OTP');
  }
}

/** Verify forgot-password OTP – returns reset_token */
export async function verifyForgotPasswordOtp(
  email: string,
  otp: string
): Promise<{ reset_token: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const data = (await parseJsonOrThrow(res, 'Invalid OTP')) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data?.message as string) ?? 'Invalid or expired OTP');
  }
  const token = data.reset_token as string;
  if (!token) throw new Error('Invalid response');
  return { reset_token: token };
}

/** Reset password with reset_token from verifyForgotPasswordOtp */
export async function resetPassword(
  resetToken: string,
  password: string,
  passwordConfirmation: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      reset_token: resetToken,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
  const data = (await parseJsonOrThrow(res, 'Failed to reset password')) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data?.message as string) ?? 'Failed to reset password');
  }
}

/** Send registration OTP – step 1 of registration */
export async function sendRegistrationOtp(params: {
  email: string;
  email_confirmation: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/register/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(params),
  });
  const data = (await parseJsonOrThrow(res, 'Registration failed')) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data?.message as string) ?? 'Registration failed');
  }
}

/** Verify registration OTP – step 2, completes registration */
export async function verifyRegistrationOtp(
  email: string,
  otp: string
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/auth/register/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ email, otp }),
  });
  const data = (await parseJsonOrThrow(res, 'Verification failed')) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data?.message as string) ?? 'Invalid or expired OTP');
  }
  return registerResponseSchema.parse(data);
}
