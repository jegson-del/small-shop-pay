import { api } from './client';
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
    throw new Error(`${fallbackMessage} (API returned empty response – check backend is running and proxy points to correct port)`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${fallbackMessage} (API returned invalid JSON – status ${res.status})`);
  }
}

/** Login – returns tokens; caller should update tokenStore and invalidate queries */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
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
  password: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}): Promise<RegisterResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  const res = await fetch('/api/auth/refresh', {
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
