import { it, vi, expect } from 'vitest'
import middleware from '../../src/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '../../src/app/api/auth/[...nextauth]/route'

vi.mock("server-only", () => {return {}})

vi.mock('next/server', () => {
  return {
    NextResponse: {
      redirect: vi.fn(),
      next: vi.fn(),
    },
    NextRequest: class {
      nextUrl: URL;

      constructor(url: string) {
        this.nextUrl = new URL(url);
      }
    },
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    return {
      set: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(() => {
        console.log('calling get')
        return {
          value: null,
        };
      })
    }
  }
)}))

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => {
    return vi.fn((req) => {
      return { mocked: true, req };
    });
  }),
}));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(() => Promise.resolve('mocked-token'))
}))

vi.mock('../../src/auth/service', () => ({
  check: vi.fn(() => Promise.reject())
}))

it('middleware redirects to login', async () => {
  const request = new (vi.mocked(NextRequest))('http://localhost')
  await middleware(request)
  expect(NextResponse.redirect).toHaveBeenCalled()
})

it('middleware catches public route', async () => {
  const request = new (vi.mocked(NextRequest))('http://localhost/login');
  (request.nextUrl as any).basePath = '/driver';
  const result = await middleware(request)
  expect(result).toEqual({ mocked: true, req: request });
})

it('middleware checks token', async () => {
  const { check } = await import('../../src/auth/service')
  vi.mocked(check).mockResolvedValue(undefined)
  const request = new (vi.mocked(NextRequest))('http://localhost')
  await middleware(request)
  expect(check).toHaveBeenCalledWith('mocked-token')
})

it('no cookie or token', async () => {
  const { getToken } = await import ('next-auth/jwt')
  vi.mocked(getToken).mockResolvedValue(null)
  const request = new (vi.mocked(NextRequest))('http://localhost')
  await middleware(request)
  expect(NextResponse.redirect).toHaveBeenCalled()
})

it('middleware checks cookie', async () => {
  const { cookies } = await import('next/headers')
  vi.mocked(cookies).mockReturnValue({ get: vi.fn(() => ({ value: 'val' })) } as any)
  const request = new (vi.mocked(NextRequest))('http://localhost')
  await middleware(request)
  expect(NextResponse.redirect).toHaveBeenCalled()
})

it('route.ts', async () => {
  GET
  POST
})
