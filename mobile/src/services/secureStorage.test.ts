/**
 * Unit tests for secureStorage – mocked expo-secure-store
 */
import * as SecureStore from 'expo-secure-store';
import { secureStorage } from './secureStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getRefreshToken returns null when no credentials', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const result = await secureStorage.getRefreshToken();

    expect(result).toBeNull();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('refresh_token');
  });

  it('getRefreshToken returns password when credentials exist', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('secret-refresh-token');

    const result = await secureStorage.getRefreshToken();

    expect(result).toBe('secret-refresh-token');
  });

  it('setRefreshToken stores in secure store', async () => {
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    await secureStorage.setRefreshToken('my-token');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refresh_token', 'my-token');
  });

  it('clearRefreshToken removes from secure store', async () => {
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    await secureStorage.clearRefreshToken();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
  });
});
