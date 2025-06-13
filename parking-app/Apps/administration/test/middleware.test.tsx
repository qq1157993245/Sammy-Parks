import { it, expect, vi } from 'vitest';
import middleware from '../src/middleware';
import { NextRequest } from 'next/server';

vi.mock('next-intl/middleware', () => {
  const createMiddleware = vi.fn(() => vi.fn(() => new Response('intl middleware')));
  return {
    __esModule: true,
    default: createMiddleware,
    createMiddleware
  };
});

vi.mock('../src/auth/service', () => ({
  check: vi.fn(() => Promise.resolve())
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'mock-token' }))
  }))
}));

it('should call check and return intl middleware for protected route', async () => {
  const req = {
    nextUrl: { basePath: '', pathname: '/es/admin/dashboard' }
  } as unknown as NextRequest;

  const result = await middleware(req);
  const text = await result.text();
  expect(text).toBe('intl middleware');
});

it('should not call check or redirect for public route', async () => {
  const req = {
    nextUrl: { basePath: '', pathname: '/es/admin/login' }
  } as unknown as NextRequest;

  const result = await middleware(req);
  const text = await result.text();
  expect(text).toBe('intl middleware');
});

it('should redirect to login on check failure', async () => {
  const req = {
    nextUrl: {
      pathname: '/es/admin/dashboard',
      origin: 'http://localhost:3000',
      href: 'http://localhost:3000/es/admin/dashboard',
      toString() {
        return this.href;
      }
    }
  } as unknown as NextRequest;

  const { check } = await import('../src/auth/service');
  (check as any).mockImplementationOnce(() => {
    throw new Error('unauthorized');
  });

  const result = await middleware(req);
  expect(result.status).toBe(307);
  expect(result.headers.get('location')).toContain('/admin/login');
});