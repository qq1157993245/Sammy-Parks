import { it, afterEach, vi, expect, beforeAll } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'

import Page from '../../src/app/[locale]/profile/page'

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
      return {plate: 'ZZZ000'}
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
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Profile'))
})

it('Opens nav drawer', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('menu'))
  expect(await screen.getByText('Vehicles'))
})

it('Navigates to permit page from nav drawer', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('menu'))
  fireEvent.click(screen.getByText('Permits'))
  await waitFor(async () => {
    expect(mockRouter.asPath).toBe('/')
  })
})

it('Navigates to vehicles page from nav drawer', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('menu'))
  fireEvent.click(screen.getByText('Vehicles'))
  await waitFor(async () => {
    expect(mockRouter.asPath).toBe('/vehicles')
  })
})

it('Navigates to vehicles page from nav drawer', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('menu'))
  fireEvent.click(screen.getByText('Tickets'))
  await waitFor(async () => {
    expect(mockRouter.asPath).toBe('/tickets')
  })
})

it('Navigates to permit page from bottom bar', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('home button'))
  await waitFor(async () => {
    expect(mockRouter.asPath).toBe('/')
  })
})