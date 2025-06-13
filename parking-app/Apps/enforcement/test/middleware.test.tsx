import { afterAll, expect, test, vi, } from 'vitest';
import { NextRequest } from 'next/server';
import middleware from '@/middleware';
import { afterEach } from 'node:test';
import { cleanup } from '@testing-library/react';

vi.mock("server-only", () => {return {}})

/************************* */
const validCookie = 'valid-cookie-123';
/************************ */

const mockedCookie = vi.hoisted(() => vi.fn());
vi.mock('next/headers', () => ({
  cookies: mockedCookie
}))

vi.mock('@/auth/service', () => ({
  check: vi.fn((cookie: string)=>{
    if (cookie !== validCookie) {
        throw new Error('Invalid cookie');
    } else {
        return Promise.resolve('Authorized')
    }
  })
}));

let mockedIntlMiddleware: () => Response;
vi.mock('next-intl/middleware', () => ({
    default: () => () => mockedIntlMiddleware(),
}));

afterEach(() => {
    cleanup();
});
afterAll(()=>{
    vi.resetAllMocks();
})

test('Invalid cookie', async () =>{
    mockedCookie.mockReturnValue({ get: () => ({ value: 'invalid-cookie-123' })});

    const req = new NextRequest('http://localhost:3150/enforcement/check-plate');
    const res = await middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3150/enforcement/login');
});

test('Valid cookie', async () =>{
    mockedCookie.mockReturnValue({ get: () => ({ value: 'valid-cookie-123' })});

     mockedIntlMiddleware = () => new Response(null, {
        status: 200,
        headers: { location: 'http://localhost:3150/enforcement/check-plate' }
    });

    const req = new NextRequest('http://localhost:3150/enforcement/check-plate');
    const res = await middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3150/enforcement/check-plate');
});