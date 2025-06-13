import mockRouter from 'next-router-mock';
import en from '../messages/en.json'
import { IntlProvider } from 'next-intl';
import { cookies } from 'next/headers';
import { setPriceAction, getVehicleByDriverIdForAdmin } from '../src/components/admin/actions';
import { authenticate, check } from '../src/auth/service';
import {
  toggleDriverAccount,
  getEnforcementAccounts,
  toggleEnforcerAccount,
  fetchTicketsForAdmin,
  overrideTicketAction,
  resolveChallengeAction,
  listTypesAction,
  fetchZoneMaxPermits,
  updateZoneMaxPermits,
} from '../src/components/admin/actions';
import { it, afterEach, vi, expect } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import * as loginActions from '../src/components/login/actions';
import { getDriverAccounts } from '../src/components/admin/actions';
import Page from '../src/app/[locale]/login/page';
import Logout from '../src/components/Logout';


vi.mock("server-only", () => { return {} });

vi.mock('next-intl/navigation', () => {
  return {
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    createNavigation: vi.fn(() => ({
      Link: vi.fn(),
      redirect: vi.fn(),
      usePathname: vi.fn(() => '/'),
      useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
      })),
      getPathname: vi.fn(() => '/'),
    }))
  };
});

vi.mock('@/i18n/navigation', async () => {
  const actual = await vi.importActual('@/i18n/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    redirect: vi.fn()
  };
});

it('logout clears session cookie', async () => {
  console.log('Mocking cookies() before logout import...');
  const mockDelete = vi.fn();

  vi.resetModules();
  vi.doMock('next/headers', () => ({
    cookies: () => ({
      delete: mockDelete
    }),
  }));

  const { logout } = await import('../src/components/login/actions');

  console.log('Calling logout...');
  await logout();
  console.log('Logout finished. Verifying if mockDelete was called.');
  expect(mockDelete).toHaveBeenCalled();
});

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    return {
      set: vi.fn(),
      delete: vi.fn()
    };
  })
}));

afterEach(() => {
  cleanup();
});

const messages = {
  common: {
    'Admin Login': 'Admin Login',
    'Sign In': 'Sign In',
    english: 'English',
    spanish: 'Spanish',
    logout: 'Logout',
  },
  login: {
    header: 'Admin Login',
    email: 'Email',
    password: 'Password',
    submit: 'Sign In',
  },
};
// import { logout } from '../src/components/login/actions';


it('login returns undefined when no user is returned from authenticate', async () => {
  const mockUser = '';
  const mockSet = vi.fn();
  const mockCookies = vi.fn().mockResolvedValue({ set: mockSet });

  vi.doMock('next/headers', () => ({
    cookies: mockCookies,
  }));

  const mockAuthenticate = vi.fn().mockResolvedValue(undefined);
  vi.doMock('../src/auth/service', () => ({
    authenticate: mockAuthenticate,
  }));

  const { login } = await import('../src/components/login/actions');
  await expect(login({ email: 'x@x.com', password: 'nope' })).rejects.toThrow('Unauthorized'); 
  // console.log('Login result:', result);
  // expect(result).toBeUndefined();
});

it('Renders admin login page', async () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Page />
    </NextIntlClientProvider>
  );
  expect(await screen.findByText('Admin Login')).toBeTruthy();
});

it('Login result with valid admin credentials', async () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Page />
    </NextIntlClientProvider>
  );
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ name: 'Anna Admin', accessToken: 'securetoken' }),
    } as Response)
  );
  await userEvent.type(screen.getByLabelText('Email'), 'anna@books.com');
  await userEvent.type(screen.getByLabelText('Password'), 'annaadmin');
  const spy = vi.spyOn(loginActions, 'login');
  fireEvent.click(screen.getByText('Sign In'));
  const result = spy.mock.results[0].value;
  await expect(result).resolves.toEqual({ name: 'Anna Admin', accessToken: 'securetoken' });
});

// it('Login result with invalid credentials', async () => {
//   render(
//     <NextIntlClientProvider locale="en" messages={messages}>
//       <Page />
//     </NextIntlClientProvider>
//   );
//   global.fetch = vi.fn(() =>
//     Promise.resolve({
//       status: 401,
//       json: () => Promise.resolve(undefined),
//     } as Response)
//   );
//   await userEvent.type(screen.getByLabelText('Email'), 'anna@books.com');
//   await userEvent.type(screen.getByLabelText('Password'), 'wrongpass');
//   const spy = vi.spyOn(loginActions, 'login');
//   fireEvent.click(screen.getByText('Sign In'));
//   const result = spy.mock.results[0].value;
//   await result.catch(() => {}); // prevent unhandled rejection warning
//   await expect(result).rejects.toThrow('Unauthorized');
// });


it('getAllDrivers unauthorized error', async () => {
  // Mock cookies() to return an invalid token
  vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
      get: vi.fn(() => ({ value: 'invalid_token' })),
      set: vi.fn(),
      delete: vi.fn()
    })),
  }));
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve('Unauthorized'),
    } as Response)
  );
  await expect(getDriverAccounts()).rejects.toThrow('Failed to load drivers');
});

it('getAllDrivers success', async () => {
  // Mock cookies() to return a valid token
  vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
      get: vi.fn(() => ({ value: 'valid_token' })),
      set: vi.fn(),
      delete: vi.fn()
    })),
  }));
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: '1', name: 'Driver A', email: 'd1@email.com', suspended: false },
        ]),
    } as Response)
  );
  const result = await getDriverAccounts();
  expect(result).toEqual([
    {
      id: '1',
      name: 'Driver A',
      email: 'd1@email.com',
      suspended: false,
      status: 'active',
    },
  ]);
});
it('toggleDriverAccount success', async () => {
  const result = await toggleDriverAccount('driver-id', true);
  expect(result).toBeUndefined();
});

it('getEnforcementAccounts success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: '1', name: 'Enforcer A', email: 'e1@email.com', suspended: true },
        ]),
    } as Response)
  );

  const result = await getEnforcementAccounts();
  expect(result).toEqual([
    {
      id: '1',
      name: 'Enforcer A',
      email: 'e1@email.com',
      suspended: true,
      status: 'suspended',
    },
  ]);
});

it('toggleEnforcerAccount success', async () => {
  const result = await toggleEnforcerAccount('enforcer-id', false);
  expect(result).toBeUndefined();
});

it('fetchTicketsForAdmin success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ data: { tickets: [{ id: '1', data: { violation: 'test', price: 100 } }] } }),
    } as Response)
  );

  const result = await fetchTicketsForAdmin();
  expect(result).toBeInstanceOf(Array);
});

it('overrideTicketAction success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ data: { overrideTicket: { id: '1' } } }),
    } as Response)
  );
  const result = await overrideTicketAction('ticket-id');
  expect(result).toBeDefined();
});

it('resolveChallengeAction success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ data: { resolveChallenge: { id: '1' } } }),
    } as Response)
  );
  const result = await resolveChallengeAction('ticket-id', true);
  expect(result).toBeDefined();
});

it('listTypesAction success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ data: { ticketTypes: [] } }),
    } as Response)
  );
  const result = await listTypesAction();
  expect(result).toBeInstanceOf(Array);
});

it('fetchZoneMaxPermits success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ data: { getZoneMaxPermits: 5 } }),
    } as Response)
  );
  const result = await fetchZoneMaxPermits('A');
  expect(result).toBeTypeOf('number');
});

it('updateZoneMaxPermits success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ data: { setZoneMaxPermits: true } }),
    } as Response)
  );
  const result = await updateZoneMaxPermits('A', 5);
  expect(result).toBe(true);
});


it('authenticate returns data on valid credentials', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ name: 'Anna Admin', accessToken: 'securetoken' }),
    } as Response)
  );
  const result = await authenticate({ email: 'anna@books.com', password: 'annaadmin' });
  expect(result).toEqual({ name: 'Anna Admin', accessToken: 'securetoken' });
});


it('authenticate rejects on invalid credentials', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 401,
      json: () => Promise.resolve({}),
    } as Response)
  );
  await expect(authenticate({ email: 'bad@user.com', password: 'wrong' })).rejects.toThrow('Unauthorized');
});

it('check resolves with admin role', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ roles: ['admin'] }),
    } as Response)
  );
  await check('valid_token');
});

it('check rejects on non-200 status', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 403,
      json: () => Promise.resolve({}),
    } as Response)
  );
  await expect(check('invalid_token')).rejects.toThrow('Unauthorized');
});

it('check rejects if roles does not include admin', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ roles: ['driver'] }),
    } as Response)
  );
  await expect(check('token')).rejects.toThrow('Unauthorized');
});

it('logout button triggers logout action', async () => {
  const spy = vi.spyOn(loginActions, 'logout').mockImplementation(() => Promise.resolve());

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Logout />
    </NextIntlClientProvider>
  );

  const button = screen.getByRole('button', { name: /logout/i });
  fireEvent.click(button);
  expect(spy).toHaveBeenCalledTimes(1);
});






it('setPriceAction returns updated ticket type', async () => {
  const mockData = { setViolationPrice: { id: 'ticket-1', price: 120, violation: 'No Permit' } };
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: mockData }),
    } as Response)
  );

  const result = await setPriceAction('ticket-1', 120);
  expect(result).toEqual(mockData.setViolationPrice);
});

it('getVehicleByDriverIdForAdmin returns vehicle data', async () => {
  const mockVehicle = { id: 'v1', plate: 'XYZ123' };
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { vehicleByDriverId: mockVehicle } }),
    } as Response)
  );

  const result = await getVehicleByDriverIdForAdmin('driver-1');
  expect(result).toEqual(mockVehicle);
});

it('getVehicleByDriverIdForAdmin returns null when vehicle not found', async () => {
  vi.mock('next/headers', () => ({
    cookies: () => ({
      get: vi.fn(() => undefined),
      set: vi.fn(),
      delete: vi.fn()
    })
  }));

  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { vehicleByDriverId: null } }),
    } as Response)
  );

  const result = await getVehicleByDriverIdForAdmin('driver-1');
  expect(result).toBeNull();
});

it('getDriverAccounts maps correct status labels', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: '1', name: 'Driver A', email: 'd1@email.com', suspended: false },
          { id: '2', name: 'Driver B', email: 'd2@email.com', suspended: true },
        ]),
    } as Response)
  );

  const result = await getDriverAccounts();
  expect(result).toEqual([
    {
      id: '1',
      name: 'Driver A',
      email: 'd1@email.com',
      suspended: false,
      status: 'active',
    },
    {
      id: '2',
      name: 'Driver B',
      email: 'd2@email.com',
      suspended: true,
      status: 'suspended',
    },
  ]);
});

it('getEnforcementAccounts maps correct status labels', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: '1', name: 'Enforcer A', email: 'e1@email.com', suspended: true },
          { id: '2', name: 'Enforcer B', email: 'e2@email.com', suspended: false },
        ]),
    } as Response)
  );

  const result = await getEnforcementAccounts();
  expect(result).toEqual([
    {
      id: '1',
      name: 'Enforcer A',
      email: 'e1@email.com',
      suspended: true,
      status: 'suspended',
    },
    {
      id: '2',
      name: 'Enforcer B',
      email: 'e2@email.com',
      suspended: false,
      status: 'active',
    },
  ]);
});

it('Locale Switcher', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  const select = screen.getByText('English').closest("select");
  fireEvent.change(select, { target: { value: 'es' } });
});
