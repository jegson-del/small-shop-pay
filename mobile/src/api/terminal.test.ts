/**
 * Unit tests for terminal API – connection token and create payment intent
 */
import { getConnectionToken, createPaymentIntent } from './terminal';
import { api } from './client';

jest.mock('./client');
jest.mock('@/config/api', () => ({ API_BASE_URL: 'http://test.api/api' }));

const mockPost = api.post as jest.MockedFunction<typeof api.post>;

beforeEach(() => {
  mockPost.mockReset();
});

describe('terminal API', () => {
  describe('getConnectionToken', () => {
    it('returns secret when API returns valid response', async () => {
      mockPost.mockResolvedValueOnce({ secret: 'conn_sec_test_123' });

      const secret = await getConnectionToken();

      expect(secret).toBe('conn_sec_test_123');
      expect(mockPost).toHaveBeenCalledWith('/terminal/connection_token');
    });

    it('throws when response has no secret', async () => {
      mockPost.mockResolvedValueOnce({});

      await expect(getConnectionToken()).rejects.toThrow('No connection token');
    });
  });

  describe('createPaymentIntent', () => {
    it('returns client_secret and payment_intent_id when API succeeds', async () => {
      mockPost.mockResolvedValueOnce({
        client_secret: 'pi_sec_xxx',
        payment_intent_id: 'pi_123',
      });

      const result = await createPaymentIntent(1000, 'gbp');

      expect(result).toEqual({
        client_secret: 'pi_sec_xxx',
        payment_intent_id: 'pi_123',
      });
      expect(mockPost).toHaveBeenCalledWith('/terminal/payment_intent', {
        amount: 1000,
        currency: 'gbp',
      });
    });

    it('defaults currency to gbp', async () => {
      mockPost.mockResolvedValueOnce({
        client_secret: 'pi_sec_yyy',
        payment_intent_id: 'pi_456',
      });

      await createPaymentIntent(500);

      expect(mockPost).toHaveBeenCalledWith('/terminal/payment_intent', {
        amount: 500,
        currency: 'gbp',
      });
    });

    it('throws when response has no client_secret', async () => {
      mockPost.mockResolvedValueOnce({ payment_intent_id: 'pi_789' });

      await expect(createPaymentIntent(100)).rejects.toThrow('Failed to create payment');
    });
  });
});
