/**
 * Unit tests for auth refresh flow
 */
import * as authApi from './auth';
import { tokenStore } from './tokenStore';
import { secureStorage } from '@/services/secureStorage';

jest.mock('@/config/api', () => ({ API_BASE_URL: 'http://test.api/api' }));

jest.mock('@/services/secureStorage', () => ({
  secureStorage: {
    getRefreshToken: jest.fn(),
    setRefreshToken: jest.fn().mockResolvedValue(undefined),
    clearRefreshToken: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  mockFetch.mockReset();
  tokenStore.clearAccessToken();
  (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);
});

describe('auth refresh', () => {
  it('refresh succeeds and stores new tokens', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('old-refresh');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        expires_in: 900,
      }),
    });

    const result = await authApi.refresh();

    expect(result).toEqual({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      expires_in: 900,
    });
    expect(secureStorage.setRefreshToken).toHaveBeenCalledWith('new-refresh');
    expect(tokenStore.getAccessToken()).toBe('new-access');
  });

  it('refresh throws when no refresh token', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);

    await expect(authApi.refresh()).rejects.toThrow('No refresh token');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('refresh clears tokens on API error', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('old-refresh');
    (secureStorage.clearRefreshToken as jest.Mock).mockResolvedValue(undefined);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Token expired' }),
    });

    await expect(authApi.refresh()).rejects.toThrow('Token expired');
    expect(secureStorage.clearRefreshToken).toHaveBeenCalled();
  });
});
