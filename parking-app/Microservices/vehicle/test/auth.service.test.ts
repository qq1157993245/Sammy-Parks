
import { it, beforeAll, afterAll, expect, vi, afterEach, beforeEach } from 'vitest'
import * as http from 'http'

import { app } from '../src/app'
import { check } from '../src/auth/service'

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

const uuid1 = '123e4567-e89b-12d3-a456-426614174000'

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
    json: () => Promise.resolve({id: uuid1})
  })

  await expect(check('plate'))
    .resolves.toBe(uuid1)
})
