// eslint-disable @typescript-eslint/no-explicit-any
import { it, expect, vi, afterEach, beforeEach } from 'vitest'

import { PlateService } from '../../src/check-plate/service'

let plateService: PlateService
beforeEach(() => {
  plateService = new PlateService()
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    return {
      set: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(() => {
        return {
          value: 'fakesession'
        }
      })
    }
  })
}))

vi.mock('server-only', () => ({}));


it('checkPlate', async () => {
  const res = {
    data: {
      getPermitByPlate: {
        id: 'permit123',
        permitTypeId: 'type123',
        driverId: 'driver123',
        vehicleId: 'vehicle123',
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-12-31T23:59:59Z',
        plate: 'ABC123',
        zone: 'A'
      }
    }
  };
  (fetch as any)
    .mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve(res)
    })

  await expect(plateService.checkPlate('fakesession', 'ABC123'))
    .resolves.toEqual(res)
})