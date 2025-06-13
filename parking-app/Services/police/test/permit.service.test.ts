
import { it, beforeAll, afterAll, expect, vi, afterEach, beforeEach } from 'vitest'
import * as http from 'http'

import app from '../src/app'
import { PermitService } from '../src/permit/permitService'

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

let service: PermitService

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
})

afterAll(() => {
  server.close()
})

beforeEach(() => {
  service = new PermitService()
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

const mockPermit = {
  vehicleId: 'v1',
  startTime: 'now',
  endTime: 'later',
  plate: 'abc123',
  zone: 'Zone 1'
}


it('Returns undefined when GraphQL throws an error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ 
      errors: [{ message: 'GraphQL Errors in checkPermit' }]
    }),
  })

  await expect(service.checkPermit('plate'))
    .rejects.toBeUndefined()
})

it('Returns undefined with fetch error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockRejectedValue(new Error('Network error'))

  await expect(service.checkPermit('plate'))
    .rejects.toBeUndefined()
})

it('Returns data on success', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ 
      data: {
        policeGetPermit: mockPermit
      }
    }),
  })

  await expect(service.checkPermit('plate'))
    .resolves.toEqual(mockPermit)
})