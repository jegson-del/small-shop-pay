/**
 * Secure storage abstraction for sensitive data (e.g. refresh_token).
 * Uses react-native-keychain for persistent, encrypted storage.
 * SOLID: Single Responsibility – storage only; no auth logic.
 */
import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.smallshoppay.refresh_token';
const KEY = 'refresh_token';

export const secureStorage = {
  async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: SERVICE });
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await Keychain.setGenericPassword(KEY, token, { service: SERVICE });
  },

  async clearRefreshToken(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE });
    } catch {
      // Ignore if nothing was stored
    }
  },
};
