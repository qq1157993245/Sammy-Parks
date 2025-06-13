import { it, afterEach, vi, expect, beforeAll } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'
import * as signupActions from '../../src/components/signup/actions'

import Page from '../../src/app/[locale]/signup/page';

afterEach(() => {
  cleanup();
});

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

vi.mock('../../src/components/signup/actions', async () => {
  return {
    signup: vi.fn(async () => {
      return { name: 'New Driver' };
    })
  };
});

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    redirect: vi.fn()
  };
});

it('Renders', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(screen.getByText('Driver Signup'))
});

it('Opens TOS modal', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await fireEvent.click(screen.getByText('Terms of Service'))
  expect(screen.getByText('1. Agreement'))
});

it('Closes TOS modal', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await fireEvent.click(screen.getByText('Terms of Service'))
  await fireEvent.click(screen.getByText('Close'));
  expect(screen.getByText('Terms of Service'))
});

it('Signs up', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  const signup = vi.mocked((await import('../../src/components/signup/actions')).signup);
  await userEvent.type(screen.getByLabelText('Name'), 'New Driver')
  await userEvent.type(screen.getByLabelText('Email'), 'new@books.com')
  await userEvent.type(screen.getByLabelText('Password'), 'abcd1234')
  await userEvent.type(screen.getByLabelText('Confirm Password'), 'abcd1234')
  await fireEvent.click(screen.getByText('Terms of Service'))
  await fireEvent.click(screen.getByLabelText('Checkbox demo'))
  await fireEvent.click(screen.getByText('Agree'))
  await fireEvent.click(screen.getByText('Sign Up'))
  expect(signup).toHaveBeenCalledWith({ name: 'New Driver', email: 'new@books.com', password: 'abcd1234', confirmPassword: 'abcd1234' });
});

it('Navigates to sign in', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await fireEvent.click(screen.getByText('Sign In'))
  expect(mockRouter.asPath).toBe('/login');
});

it('Navigates to landing page', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await fireEvent.click(screen.getByText('Sammy Parks.'))
  expect(mockRouter.asPath).toBe('/login');
});

it('Fails signup', async () => {
  vi.spyOn(signupActions, 'signup').mockResolvedValueOnce(undefined)
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await userEvent.type(screen.getByLabelText('Name'), 'New Driver')
  await userEvent.type(screen.getByLabelText('Email'), 'new@books.com')
  await userEvent.type(screen.getByLabelText('Password'), 'abcd1234')
  await userEvent.type(screen.getByLabelText('Confirm Password'), 'abcd1234')
  await fireEvent.click(screen.getByText('Terms of Service'))
  await fireEvent.click(screen.getByLabelText('Checkbox demo'))
  await fireEvent.click(screen.getByText('Agree'))
  await fireEvent.click(screen.getByText('Sign Up'))
  const alert = await screen.findByRole('alert');
  expect(screen.getByRole('alert'))
})

it('Fails signup close alert', async () => {
  vi.spyOn(signupActions, 'signup').mockResolvedValueOnce(undefined)
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await userEvent.type(screen.getByLabelText('Name'), 'New Driver')
  await userEvent.type(screen.getByLabelText('Email'), 'new@books.com')
  await userEvent.type(screen.getByLabelText('Password'), 'abcd1234')
  await userEvent.type(screen.getByLabelText('Confirm Password'), 'abcd1234')
  await fireEvent.click(screen.getByText('Terms of Service'))
  await fireEvent.click(screen.getByLabelText('Checkbox demo'))
  await fireEvent.click(screen.getByText('Agree'))
  await fireEvent.click(screen.getByText('Sign Up'))
  const alert = await screen.findByRole('alert');

  await fireEvent.click(screen.getByLabelText('Close'))
  expect(!screen.getByRole('alert'))
})

it('Fails signup alert stays open on clickaway', async () => {
  vi.spyOn(signupActions, 'signup').mockResolvedValueOnce(undefined)
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await userEvent.type(screen.getByLabelText('Name'), 'New Driver')
  await userEvent.type(screen.getByLabelText('Email'), 'new@books.com')
  await userEvent.type(screen.getByLabelText('Password'), 'abcd1234')
  await userEvent.type(screen.getByLabelText('Confirm Password'), 'abcd1234')
  await fireEvent.click(screen.getByText('Terms of Service'))
  await fireEvent.click(screen.getByLabelText('Checkbox demo'))
  await fireEvent.click(screen.getByText('Agree'))
  await fireEvent.click(screen.getByText('Sign Up'))
  const alert = await screen.findByRole('alert');

  await fireEvent.click(document.body);
  expect(screen.getByRole('alert'))
})