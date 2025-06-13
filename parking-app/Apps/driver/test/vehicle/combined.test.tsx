import { it, afterEach, vi, expect, beforeAll } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as loginActions from '../../src/components/login/actions'
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
      delete: vi.fn(),
      get: vi.fn(() => {
        return {
          value: 'fakesession'
        }
      }),
      getAll: vi.fn(() => {
        return [{
          value: 'fakesession'
        }]
      })
    }
  })
}))

vi.mock('../../src/vehicle/service', () => {
  return {
    list: vi.fn(),
    add: vi.fn(async () => {
      return {plate: 'ZZZ000'}
    })
  };
});

it('Renders', async () => {
  const { list } = await import('../../src/vehicle/service');
  vi.mocked(list).mockResolvedValue([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Vehicles'))
})

it('Navigates to login', async () => {
  const { list } = await import('../../src/vehicle/service');
  vi.mocked(list).mockResolvedValue([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('logout button'))
  await waitFor(async () => {
    expect(mockRouter.asPath).toBe('/')
  })
})

it('Displays vehicles', async () => {
  const { list } = await import('../../src/vehicle/service');
  vi.mocked(list).mockResolvedValue([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await waitFor(async () => {
    expect(await screen.getByText('ABC123'))
  })
})

it('Add vehicle', async () => {
  const { list } = await import('../../src/vehicle/service');
  vi.mocked(list).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]).mockResolvedValue([
    { plate: 'ABC123', id: '1', state: 'CA' }, { plate: 'ZZZ000', id: '2', state: 'CA' }
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