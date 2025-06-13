import { it, afterEach, vi, expect, beforeAll } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as loginActions from '../../src/components/login/actions'
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'

import Page from '../../src/app/[locale]/login/page'

afterEach(() => {
  cleanup()
})

beforeAll(() => {
  global.fetch = vi.fn((url) => {
    if (typeof url === 'string' && url.startsWith('/api/auth/')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    }
    // fallback for other URLs
    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  }) as any;
});

vi.mock("server-only", () => {return {}})

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    redirect: vi.fn()
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    return {
      set: vi.fn(),
      delete: vi.fn()
    }
  }
)}))

vi.mock('../../src/auth/service', () => {
  return {
    authenticate: vi.fn()
  }
})

it('Renders', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Driver Login'))
})

it('Login result with valid credentials', async () => {
  const { authenticate } = await import('../../src/auth/service');
  vi.mocked(authenticate).mockResolvedValueOnce({name: 'Molly Member', accessToken: 'faketoken'})
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await userEvent.type(screen.getByLabelText('Email'), 'molly@books.com')
  await userEvent.type(screen.getByLabelText('Password'), 'mollymember')
  const spy = vi.spyOn(loginActions, 'login')
  fireEvent.click(screen.getByText('Sign In'))
  const result = spy.mock.results[0].value;
  await expect(result).resolves.toEqual({name: 'Molly Member', accessToken: 'faketoken'});
})

it('Login result with invalid credentials', async () => {
  const { authenticate } = await import('../../src/auth/service');
  vi.mocked(authenticate).mockResolvedValue(undefined)
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await userEvent.type(screen.getByLabelText('Email'), 'molly@books.com')
  await userEvent.type(screen.getByLabelText('Password'), 'mollymem')
  const spy = vi.spyOn(loginActions, 'login')
  fireEvent.click(screen.getByText('Sign In'))
  const result = spy.mock.results[0].value
  await expect(result).resolves.toEqual(undefined)
})