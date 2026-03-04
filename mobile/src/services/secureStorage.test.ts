/**
 * Unit tests for secureStorage – mocked keychain
 */
import * as Keychain from 'react-native-keychain';
import { secureStorage } from './secureStorage';

jest.mock('react-native-keychain');

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getRefreshToken returns null when no credentials', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(null);

    const result = await secureStorage.getRefreshToken();

    expect(result).toBeNull();
    expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
      service: 'com.smallshoppay.refresh_token',
    });
  });

  it('getRefreshToken returns password when credentials exist', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'refresh_token',
      password: 'secret-refresh-token',
    });

    const result = await secureStorage.getRefreshToken();

    expect(result).toBe('secret-refresh-token');
  });

  it('setRefreshToken stores in keychain', async () => {
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(undefined);

    await secureStorage.setRefreshToken('my-token');

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'refresh_token',
      'my-token',
      { service: 'com.smallshoppay.refresh_token' }
    );
  });

  it('clearRefreshToken resets keychain', async () => {
    (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(undefined);

    await secureStorage.clearRefreshToken();

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'com.smallshoppay.refresh_token',
    });
  });
});
