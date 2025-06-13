import { it, afterEach, vi, expect, beforeAll } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'

import Page from '../../src/app/[locale]/vehicles/page'

afterEach(() => {
  cleanup()
})

beforeAll(() => {
  globalThis.fetch = vi.fn((input, init) => {
    if (typeof input === 'string' && input.includes('/api/auth/session')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => '',
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
    });
  }) as any;
});

vi.mock('../../src/components/login/actions', async () => {
  return {
    logout: vi.fn()
  }
})

vi.mock('../../src/components/vehicle/actions', async () => {
  return {
    listAction: vi.fn(),
    addAction: vi.fn(async () => {
      return {plate: 'ZZZ000', state: 'TX', id: '2'}
    })
  }
})

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    redirect: vi.fn()
  };
});

it('Renders', async () => {
  const { listAction } = await import('../../src/components/vehicle/actions');
  vi.mocked(listAction).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]);
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Vehicles'))
})

it('Displays vehicle plate number', async () => {
  const { listAction } = await import('../../src/components/vehicle/actions');
  vi.mocked(listAction).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]);
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await waitFor(async () => {
    expect(screen.getByText('ABC123'))
  })
})

it('Displays vehicle state', async () => {
  const { listAction } = await import('../../src/components/vehicle/actions');
  vi.mocked(listAction).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]);
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await waitFor(async () => {
    expect(screen.getByText('CA'))
  })
})

it('Logout exists', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByLabelText('logout button'))
})

/* doesn't work
it('Logout called correctly', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('logout button'))
  const logout = vi.mocked((await import('../../src/components/login/actions')).logout)
  expect(logout).toHaveBeenCalled()
})
*/
it('Opens add vehicle dialog', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('add vehicle'))
  expect(await screen.getByText('Add Vehicle'))
})

it('Closes add vehicle dialog', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('add vehicle'))
  fireEvent.click(screen.getByText('Cancel'))
  expect(await screen.getByText('Vehicles'))
})

it('Add vehicle', async () => {
  const { listAction } = await import('../../src/components/vehicle/actions');
  vi.mocked(listAction).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]).mockResolvedValue([
    { plate: 'ABC123', id: '1', state: 'CA' }, {plate : 'ZZZ000', id: '2', state: 'TX'}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(await screen.findByLabelText('add vehicle'))
  await userEvent.type(await screen.findByText('License Plate'), 'ZZZ000')
  await userEvent.type(await screen.findByText('State'), 'TX')
  fireEvent.click(await screen.findByText('Submit'))
  expect(await screen.findByText('ZZZ000'))
})

it('Opens nav drawer', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('menu'))
  expect(await screen.getByText('Permits'))
})