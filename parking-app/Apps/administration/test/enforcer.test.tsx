import { it, vi, expect } from 'vitest';
import { getAllEnforcers, toggleEnforcerSuspension } from '../src/services/enforcers';

global.fetch = vi.fn();



vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    return {
      get: vi.fn(() => ({ value: 'mock-session-token' }))
    };
  })
}));


it('getAllEnforcers unauthorized error', async () => {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({})
  } as Response);

  await expect(getAllEnforcers()).rejects.toThrow('Failed to load enforcers');
});

it('toggleEnforcerSuspension unauthorized error', async () => {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: false,
    status: 403,
    json: async () => ({})
  } as Response);

  await expect(toggleEnforcerSuspension('123', false)).rejects.toThrow('Failed to toggle enforcer suspension');
});

it('getAllEnforcers success', async () => {
  const mockEnforcers = [
    { id: '1', name: 'John', email: 'john@email.com', suspended: false },
    { id: '2', name: 'Jane', email: 'jane@email.com', suspended: true }
  ];

  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => mockEnforcers
  } as Response);

  const result = await getAllEnforcers();
  expect(result).toEqual([
    { id: '1', name: 'John', email: 'john@email.com', suspended: false, status: 'active' },
    { id: '2', name: 'Jane', email: 'jane@email.com', suspended: true, status: 'suspended' }
  ]);
});

it('toggleEnforcerSuspension success', async () => {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({})
  } as Response);

  await expect(toggleEnforcerSuspension('1', true)).resolves.toBeUndefined();
});
