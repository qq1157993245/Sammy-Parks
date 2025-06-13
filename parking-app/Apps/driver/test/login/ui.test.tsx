import { it, afterEach, vi, expect, beforeAll } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'
import SessionWrapper from '../../src/components/SessionWrapper';

import Page from '../../src/app/[locale]/login/page';

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

vi.mock('../../src/components/login/actions', async () => {
  return {
    login: vi.fn(async () => {
      return { name: 'Molly Member' };
    }),
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

vi.mock('@/i18n/navigation', async () => {
  const actual = await vi.importActual('@/i18n/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    redirect: vi.fn()
  }})
  
vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual('next-auth/react');
  return {
    ...actual,
    signIn: vi.fn(),
    SessionProvider: actual.SessionProvider,
  };
});

it('Renders', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Driver Login'))
});

it('Email entry exists', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByLabelText('Email'))
});

it('Password entry exists', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByLabelText('Password'))
});

it('Login button exists', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Sign In'))
});

it('Login called correctly', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await userEvent.type(screen.getByLabelText('Email'), 'molly@books.com');
  await userEvent.type(screen.getByLabelText('Password'), 'mollymember');
  const login = vi.mocked((await import('../../src/components/login/actions')).login);
  fireEvent.click(screen.getByText('Sign In'));
  expect(login).toHaveBeenCalledWith({ email: 'molly@books.com', password: 'mollymember' });
});

it('Navigates to home page', async () => {

  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  await userEvent.type(screen.getByLabelText('Email'), 'molly@books.com');
  await userEvent.type(screen.getByLabelText('Password'), 'mollymember');
  fireEvent.click(screen.getByText('Sign In'));
  expect(mockRouter.asPath).toBe('/');
});

it('Session Wrapper', async () => {
  render(
    <SessionWrapper>
      test
    </SessionWrapper>
  );
  expect(await screen.getByText('test'))
});

it('Locale Switcher', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  const select = screen.getByText('English').closest("select");
  if (select) {
    fireEvent.change(select, { target: { value: 'es' } });
  }
});

it('Navigates to signup', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByText('Create an account'));
  expect(mockRouter.asPath).toBe('/signup');
})

it('Navigates to landing page', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByText('Sammy Parks.'));
  expect(mockRouter.asPath).toBe('/signup');
})

it('Google sign-in button calls signIn', async () => {
  const { signIn } = await import('next-auth/react');
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  const googleButton = await screen.findByText('Continue With Google');
  fireEvent.click(googleButton);
  expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/driver' });
});

it('shows error message on failed login', async () => {
  const login = vi.mocked((await import('../../src/components/login/actions')).login);
  login.mockResolvedValueOnce(undefined);

  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  await userEvent.type(screen.getByLabelText('Email'), 'fail@user.com');
  await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
  fireEvent.click(screen.getByText('Sign In'));

  expect(await screen.findByText('Invalid credentials'))
});