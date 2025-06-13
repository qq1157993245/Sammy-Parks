// eslint-disable @typescript-eslint/no-explicit-any

import { it, beforeAll, afterAll, expect, vi, afterEach, beforeEach } from 'vitest'

import { check, authenticate, extractCookie } from '../../src/auth/service'


beforeEach(() => {
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


it('Check Throws an error when status is not 200', async () => {
  (fetch as any).mockResolvedValueOnce({
    status: 403
  })

  await expect(check('plate'))
    .rejects.toThrow()
})

it('Check Returns true when status is 200', async () => {
  const res = {
    roles: ['driver']
  };

  (fetch as any).mockResolvedValueOnce({
    status: 200,
    json: () => Promise.resolve(res)
  })

  await expect(check('plate'))
    .rejects.toThrow()
})

it('Check Returns true when status is 200', async () => {
  const res = {
    roles: ['enforcement']
  };

  (fetch as any).mockResolvedValueOnce({
    status: 200,
    json: () => Promise.resolve(res)
  })

  await expect(check('plate'))
    .resolves.toBe(res)
})

it('Authenticate returns undefined when status is not 200', async () => {
  (fetch as any).mockResolvedValueOnce({
    status: 403
  })

  await expect(authenticate({ email: 'user@exam.com', password: 'pass' }))
    .resolves.toBeUndefined()
})

it('Authenticate returns name and token on success', async () => {
  const res = {
    name: 'Test User',
    accessToken: 'test_access_token'
  };
  (fetch as any).mockResolvedValueOnce({
    status: 200,
    json: () => Promise.resolve(res)
  })

  await expect(authenticate({ email: 'user@exam.com', password: 'pass' }))
    .resolves.toEqual(res)
})

it('extractCookie returns cookie', async () => {
  await expect(extractCookie())
    .resolves.toEqual('fakesession')
})

