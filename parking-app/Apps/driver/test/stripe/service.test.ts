import { it, vi, expect, beforeEach, afterEach } from 'vitest'
import { createSession } from '../../src/stripe/service'

afterEach(() => {
  vi.restoreAllMocks()
})

const badItem = {
  productName: '',
  currency: '',
  amount: 0,
  url: 'invalid-url',
}

const goodItem = {
  productName: 'Test Product',
  currency: 'usd',
  amount: 1000,
  url: 'https://example.com/return',
}

it('resolves with url on success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    json: async () => ({ url: 'https://stripe.com/session/123' }),
  }));

  const result = await createSession(goodItem);

  expect(result).toBe('https://stripe.com/session/123');
});

it('rejects with Unauthorized on fetch error', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));

  await expect(createSession({
    productName: 'Test',
    currency: 'usd',
    amount: 1000,
    url: 'https://return.url',
  })).rejects.toBe('Unauthorized');
});