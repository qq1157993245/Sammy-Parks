// eslint-disable @typescript-eslint/no-explicit-any
import { it, expect, vi, afterEach, beforeEach } from 'vitest'

import { TicketService } from '../../src/ticket/service'

let ticketService: TicketService
beforeEach(() => {
  ticketService = new TicketService()
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

it('listTypes throws an error when cookie is missing', async () => {
  await expect(ticketService.listTypes(undefined))
    .rejects.toThrow('Unauthorized')
})

it('listTypes rejects when 404', async () => {
  (fetch as any).mockResolvedValueOnce({
    status: 404,
    json: () => Promise.resolve({
      errors: [{ message: 'Not Found' }]
    })
  })

  await expect(ticketService.listTypes('fakesession'))
    .rejects.toThrow()
})

it('listTypes rejects when fetch errors', async () => {
  (fetch as any).mockResolvedValueOnce(new Error('Network Error'))

  await expect(ticketService.listTypes('fakesession'))
    .rejects.toThrow()
})

it('listTypes resolves', async () => {
  const res = {
    data: {
      ticketTypes: [
        { id: '1', name: 'Type 1' },
        { id: '2', name: 'Type 2' }
      ]
    }
  };
  (fetch as any).mockResolvedValueOnce({
    status: 200,
    json: () => Promise.resolve(res)
  })

  await expect(ticketService.listTypes('fakesession'))
    .resolves.toEqual(res.data.ticketTypes)
})

it('createTicket', async () => {
  (fetch as any)
    .mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve({
        data: {
          getVehicleByPlate: {
            id: 'vehicle123',
            driverId: 'driver123',
            plate: 'ABC123'
          }
        }
      })
    })
    .mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve({
        data: {
          createTicket: {
            id: 'abv123'
          }
        }
      })
    })

  await expect(ticketService.createTicket('fakesession', 'ABC123', 'Speeding Violation'))
    .resolves.toEqual({
      data: {
        createTicket: {
          id: 'abv123'
        }
      }
    })
})