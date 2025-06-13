import { it, vi, expect, beforeEach } from 'vitest';
import { getZoneMaxPermits, setZoneMaxPermits } from '../src/services/permits';


vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    return {
      get: vi.fn(() => ({ value: 'mock-session-token' }))
    };
  })
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

it('getZoneMaxPermits unauthorized error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve('Unauthorized'),
    } as Response)
  );

  const result = await getZoneMaxPermits('A');
  expect(result).toBeNull();
});

it('getZoneMaxPermits success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { getZoneMaxPermits: 5 } }),
    } as Response)
  );

  const result = await getZoneMaxPermits('A');
  expect(result).toBe(5);
});

it('setZoneMaxPermits unauthorized error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve('Unauthorized'),
    } as Response)
  );

  const result = await setZoneMaxPermits('A', 10);
  expect(result).toBe(false);
});

it('setZoneMaxPermits success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { setZoneMaxPermits: true } }),
    } as Response)
  );

  await expect(setZoneMaxPermits('A', 10)).resolves.toBe(true);
});