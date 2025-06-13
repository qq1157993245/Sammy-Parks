let mockCookiesGet = vi.fn(() => ({ value: 'test-session-token' }));

import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fetchVehicleByDriverId } from '../src/services/vehicles';

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: mockCookiesGet
  }),
}));

global.fetch = vi.fn();

afterEach(() => {
  vi.restoreAllMocks();
});

it('returns null when no driverId is provided', async () => {
  const result = await fetchVehicleByDriverId('');
  expect(result).toBeNull();
});

it('calls fetch and returns vehicle data if valid', async () => {
  (fetch as any).mockResolvedValue({
    json: () => Promise.resolve({
      data: {
        vehicleByDriverId: {
          id: 'vehicle-123',
          plate: 'ABC123'
        }
      }
    }),
    status: 200,
  });

  const result = await fetchVehicleByDriverId('driver-1');
  expect(fetch).toHaveBeenCalled();
  expect(result).toEqual({ id: 'vehicle-123', plate: 'ABC123' });
});

it('returns null if GraphQL returns errors', async () => {
  (fetch as any).mockResolvedValue({
    json: () => Promise.resolve({
      data: {},
      errors: [{ message: 'Something went wrong' }]
    }),
    status: 200,
  });

  const result = await fetchVehicleByDriverId('driver-1');
  expect(result).toBeNull();
});

it('falls back correctly when cookie is undefined and vehicleByDriverId is null', async () => {
  // @ts-expect-error: mock can return undefined for this test case
  mockCookiesGet.mockReturnValue(undefined);

  (fetch as any).mockResolvedValue({
    json: () => Promise.resolve({
      data: {
        vehicleByDriverId: null
      }
    }),
    status: 200,
  });

  const result = await fetchVehicleByDriverId('driver-1');
  expect(result).toBeNull();
});