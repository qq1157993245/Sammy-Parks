
import { it, beforeAll, afterAll, expect, vi, afterEach, beforeEach } from 'vitest'
import * as http from 'http'

import app from '../src/app'
import { check, getIdByEmail } from '../src/auth/service'

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
})

afterAll(() => {
  server.close()
})

beforeEach(() => {
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})


it('Throws an error when status is not 200', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    status: 403
  })

  await expect(check('plate'))
    .rejects.toThrow()
})

it('Returns true when status is 200', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    status: 200,
    json: () => Promise.resolve(true)
  })

  await expect(check('name'))
    .resolves.toBe(true)
})

it('getIdByEmail returns undefined when status is not 200', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    status: 403
  })

  await expect(getIdByEmail('plate'))
    .resolves.toBeUndefined()
})

it('getIdByEmail Fetch throws an error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockRejectedValue(new Error('Network error'))

  await expect(getIdByEmail('plate'))
    .rejects.toThrow()
})

it('getIdByEmail Returns Member when fetch succeeds', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockResolvedValueOnce({
    status: 200,
    json: () => Promise.resolve({ id: '123', name: 'Molly' })
  })

  await expect(getIdByEmail('molly@books.com'))
    .resolves.toEqual({ id: '123', name: 'Molly' })
})


