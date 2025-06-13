
import { it, beforeAll, afterAll, expect, vi, afterEach, beforeEach } from 'vitest'
import * as http from 'http'

import app from '../src/app'
import { TicketService } from '../src/ticket/ticketService'

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

let service: TicketService

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
})

afterAll(() => {
  server.close()
})

beforeEach(() => {
  service = new TicketService()
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

const output1 = {
  "data": {
    "ticketsByDriver": [
      {
        "id": "ticket1",
        "data": {
          "violation": "Expired Meter",
          "overridden": true,
          "paid": false,
          "price": 35.0,
          "createdAt": "2024-06-01T12:00:00Z",
          "challengeAccepted": false
        }
      },
      {
        "id": "ticket2",
        "data": {
          "violation": "No Permit",
          "overridden": false,
          "paid": true,
          "price": 50.0,
          "createdAt": "2024-05-20T09:30:00Z",
          "challengeAccepted": false
        }
      },
      {
        "id": "ticket3",
        "data": {
          "violation": "Fire Lane",
          "overridden": false,
          "paid": false,
          "price": 100.0,
          "createdAt": "2024-04-15T15:45:00Z",
          "challengeAccepted": true
        }
      },
      {
        "id": "ticket4",
        "data": {
          "violation": "dog water",
          "overridden": false,
          "paid": false,
          "price": 100.0,
          "createdAt": "2024-04-15T15:45:00Z",
          "challengeAccepted": false
        }
      }
    ]
  }
}

const output2 = {
  "data": {
    "ticketsByDriver": [
      {
        "id": "ticket4",
        "data": {
          "violation": "dog water",
          "overridden": false,
          "paid": false,
          "price": 100.0,
          "createdAt": "2024-04-15T15:45:00Z",
          "challengeAccepted": false
        }
      }
    ]
  }
}

const expectRes = [
  {
    "violation": "dog water",
    "price": 100.0,
    "createdAt": "2024-04-15T15:45:00Z"
  }
]

it('Returns undefined when fetch does not return 200', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    status: 404
  })

  await expect(service.checkTicket('name'))
    .resolves.toBeUndefined()
})

it('Returns array of tickets', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    status: 200,
    json: () => Promise.resolve(output2)
  })

  await expect(service.checkTicket('name'))
    .resolves.toEqual(expectRes)
})

it('Array should have 1 element after filtering', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    status: 200,
    json: () => Promise.resolve(output1)
  })

  await expect(service.checkTicket('name'))
    .resolves.toHaveLength(1)
})

it('Returns empty array', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    status: 200,
    json: () => Promise.resolve({})
  })

  await expect(service.checkTicket('name'))
    .resolves.toEqual([])
})

/*
it('Returns undefined when GraphQL throws an error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ 
      errors: [{ message: 'GraphQL Errors in checkTicket' }]
    }),
  })

  await expect(service.checkTicket('name'))
    .rejects.toBeUndefined()
})

it('Returns undefined with fetch error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockRejectedValue(new Error('Network error'))

  await expect(service.checkTicket('name'))
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
*/