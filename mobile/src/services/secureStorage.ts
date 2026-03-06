/**
 * Secure storage for sensitive data (e.g. refresh_token).
 * Uses expo-secure-store so it works in Expo Go and in production builds.
 */
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'refresh_token';

export const secureStorage = {
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clearRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      // Ignore if nothing was stored
    }
  },
};
