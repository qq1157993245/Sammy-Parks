import { it, afterEach, vi, expect, beforeAll } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as signupActions from '../../src/components/signup/actions'
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'

import Page from '../../src/app/[locale]/signup/page'

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
    createNewAccount: vi.fn()
  }
})

vi.mock('../../src/terms/service', () => {
  return {
    accepterms: vi.fn(),
    declineterms: vi.fn()
  }
})

it('Renders', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Driver Signup'))
})

it('Signs up', async () => {
  const { createNewAccount } = await import('../../src/auth/service');
  vi.mocked(createNewAccount).mockResolvedValueOnce({name: 'New Driver', accessToken: 'faketoken'})
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  const spy = vi.spyOn(signupActions, 'signup')
  await userEvent.type(screen.getByLabelText('Name'), 'New Driver')
  await userEvent.type(screen.getByLabelText('Email'), 'new@books.com')
  await userEvent.type(screen.getByLabelText('Password'), 'abcd1234')
  await userEvent.type(screen.getByLabelText('Confirm Password'), 'abcd1234')
  await fireEvent.click(screen.getByText('Terms of Service'))
  await fireEvent.click(screen.getByLabelText('Checkbox demo'))
  await fireEvent.click(screen.getByText('Agree'))
  await fireEvent.click(screen.getByText('Sign Up'))
  const result = spy.mock.results[0].value;
  await expect(result).resolves.toEqual({name: 'New Driver', accessToken: 'faketoken'});
});

it('Fails Sign up', async () => {
  const { createNewAccount } = await import('../../src/auth/service');
  vi.mocked(createNewAccount).mockResolvedValueOnce(undefined)
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  const spy = vi.spyOn(signupActions, 'signup')
  await userEvent.type(screen.getByLabelText('Name'), 'New Driver')
  await userEvent.type(screen.getByLabelText('Email'), 'new@books.com')
  await userEvent.type(screen.getByLabelText('Password'), 'abcd1234')
  await userEvent.type(screen.getByLabelText('Confirm Password'), 'abcd1234')
  await fireEvent.click(screen.getByText('Terms of Service'))
  await fireEvent.click(screen.getByLabelText('Checkbox demo'))
  await fireEvent.click(screen.getByText('Agree'))
  await fireEvent.click(screen.getByText('Sign Up'))
  expect(screen.getByText('Driver Signup'))
  const result = spy.mock.results[0].value;
  await expect(result).resolves.toEqual(undefined);
});