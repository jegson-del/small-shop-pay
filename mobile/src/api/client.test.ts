/**
 * Unit tests for API client – auth header attachment
 */
import { api } from './client';
import { tokenStore } from './tokenStore';

jest.mock('@/config/api', () => ({
  API_BASE_URL: 'http://test.api/api',
}));

jest.mock('@/services/secureStorage', () => ({
  secureStorage: {
    getRefreshToken: jest.fn().mockResolvedValue(null),
    setRefreshToken: jest.fn().mockResolvedValue(undefined),
    clearRefreshToken: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  mockFetch.mockReset();
  tokenStore.clearAccessToken();
});

describe('api client', () => {
  it('adds Authorization header when access token is set', async () => {
    tokenStore.setAccessToken('fake-access-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await api.get('/auth/me');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    const call = mockFetch.mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer fake-access-token');
  });

  it('does not add Authorization header when skipAuth is true', async () => {
    tokenStore.setAccessToken('fake-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await api.post('/auth/login', { email: 'a@b.com', password: 'x' }, { skipAuth: true });

    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });
});
