/**
 * Module-based token store for access_token and refresh_token.
 * Used by the API client and auth mutations. Not reactive; for sync access only.
 */

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenStore = {
  getAccessToken: (): string | null => accessToken,
  getRefreshToken: (): string | null => refreshToken,

  setTokens: (access: string, refresh: string): void => {
    accessToken = access;
    refreshToken = refresh;
  },

  clear: (): void => {
    accessToken = null;
    refreshToken = null;
  },

  hasTokens: (): boolean => !!accessToken && !!refreshToken,
};
