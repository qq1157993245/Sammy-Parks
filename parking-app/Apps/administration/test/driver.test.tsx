import { it, vi, expect } from 'vitest';
import { getAllDrivers, toggleDriverSuspension } from '../src/services/drivers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    return {
      get: vi.fn(() => ({ value: 'mock-session-token' }))
    };
  })
}));

it('getAllDrivers unauthorized error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve('Unauthorized'),
    } as Response)
  );

  await expect(getAllDrivers()).rejects.toThrow('Failed to load drivers');
});

it('toggleDriverSuspension unauthorized error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve('Unauthorized'),
    } as Response)
  );

  await expect(toggleDriverSuspension('driver-id', true)).rejects.toThrow('Failed to toggle driver suspension');
});

it('getAllDrivers success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: '1', name: 'Driver A', email: 'd1@email.com', suspended: false },
        ]),
    } as Response)
  );

  const result = await getAllDrivers();
  expect(result).toEqual([
    {
      id: '1',
      name: 'Driver A',
      email: 'd1@email.com',
      suspended: false,
      status: 'active',
    },
  ]);
});

it('toggleDriverSuspension success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)
  );

  await expect(toggleDriverSuspension('1', false)).resolves.toBeUndefined();
});
