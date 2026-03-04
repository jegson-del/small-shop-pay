import { api } from './client';
import { tokenStore } from './tokenStore';
import {
  userSchema,
  loginResponseSchema,
  type User,
  type LoginResponse,
} from '@/schemas/auth';
import { API_BASE_URL } from '@/config/api';

/** Refresh – get new tokens from refresh_token in keychain; stores them on success */
export async function refresh(): Promise<LoginResponse> {
  const refreshToken = await tokenStore.getRefreshTokenAsync();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) {
    await tokenStore.clear();
    throw new Error(data?.message ?? 'Refresh failed');
  }

  const parsed = loginResponseSchema.parse(data);
  await tokenStore.setTokens(parsed.access_token, parsed.refresh_token);
  return parsed;
}

/** Login – returns tokens; caller should call tokenStore.setTokens */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? 'Login failed');
  }

  return loginResponseSchema.parse(data);
}

/** Logout – revokes refresh token on server, clears local storage */
export async function logout(): Promise<void> {
  const refresh = await tokenStore.getRefreshTokenAsync();
  if (refresh) {
    try {
      await api.post('/auth/logout', { refresh_token: refresh }, { skipAuth: true });
    } finally {
      await tokenStore.clear();
    }
  } else {
    await tokenStore.clear();
  }
}

/** Get current user – requires valid access token */
export async function getMe(): Promise<User> {
  const data = await api.get<unknown>('/auth/me');
  return userSchema.parse(data);
}
