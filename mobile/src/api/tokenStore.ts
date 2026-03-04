/**
 * Token store: in-memory access_token, secure storage for refresh_token.
 * Access token is short-lived; refresh token persists in keychain.
 */
import { secureStorage } from '@/services/secureStorage';

let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken: (): string | null => accessToken,
  getRefreshTokenAsync: secureStorage.getRefreshToken,
  setRefreshToken: secureStorage.setRefreshToken,
  clearRefreshToken: secureStorage.clearRefreshToken,

  setAccessToken: (token: string): void => {
    accessToken = token;
  },

  clearAccessToken: (): void => {
    accessToken = null;
  },

  /** Store both tokens after login/refresh */
  setTokens: async (access: string, refresh: string): Promise<void> => {
    accessToken = access;
    await secureStorage.setRefreshToken(refresh);
  },

  /** Clear all tokens (logout) */
  clear: async (): Promise<void> => {
    accessToken = null;
    await secureStorage.clearRefreshToken();
  },

  /** True if we have a refresh token (user may be logged in) */
  hasRefreshToken: (): Promise<boolean> =>
    secureStorage.getRefreshToken().then((t) => !!t),
};
