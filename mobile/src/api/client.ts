import { API_BASE_URL } from '@/config/api';
import { tokenStore } from './tokenStore';
import { loginResponseSchema } from '@/schemas/auth';

async function doRefresh(): Promise<void> {
  const refresh = await tokenStore.getRefreshTokenAsync();
  if (!refresh) {
    await tokenStore.clear();
    throw new Error('No refresh token');
  }

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    await tokenStore.clear();
    throw new Error(data?.message ?? 'Token refresh failed');
  }

  const parsed = loginResponseSchema.parse(data);
  await tokenStore.setTokens(parsed.access_token, parsed.refresh_token);
}

export type RequestConfig = RequestInit & {
  skipAuth?: boolean;
  skipRefreshRetry?: boolean;
};

export async function apiRequest<T>(
  path: string,
  config: RequestConfig = {}
): Promise<T> {
  const { skipAuth = false, skipRefreshRetry = false, ...init } = config;

  const url = path.startsWith('http') ? path : `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = tokenStore.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && !skipAuth && !skipRefreshRetry) {
    try {
      await doRefresh();
      const newToken = tokenStore.getAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
      }
      res = await fetch(url, { ...init, headers });
    } catch {
      await tokenStore.clear();
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message ?? `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: 'GET' }),

  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: 'DELETE' }),
};
