import { it, afterEach, vi, expect, beforeAll} from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'
import * as stripeActions from '../../src/components/stripe/actions';
import * as stripe from '../../src/stripe/service'

import Page from '../../src/app/[locale]/tickets/page'

afterEach(() => {
  cleanup()
})

beforeAll(() => {
  window.alert = vi.fn()
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
      json: async () => ({id: 1}),
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
    useSearchParams: () => ({
      get: (key: string) => {
        if (key === 'session_id') return 'session_id';
        if (key === 'paidTicket') return 'type';
        return undefined;
      }
    }),
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
      })
    }
  })
}))

vi.mock('../../src/ticket/service', async () => {
    return {
        getTicketsForDriver: vi.fn(async () => {
            return [{id: 1, data: {violation: 'No Permit', price: '20', paid: false}}]
        }),
        markTicketAsPaid: vi.fn(),
        challengeTicket: vi.fn()
    }
})

vi.mock('../../src/stripe/service', async () => {
  return {
    createSession: vi.fn()
  }
})

it('Renders', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Tickets'))
})

it('Displays ticket reason', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.findByText(/No Permit/))
})

it('Pays ticket', async () => {
  const spy = vi.spyOn(stripe, 'createSession')
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(await screen.findByText('Pay Now'))
  expect(spy).toHaveBeenCalled()
})

it('Pay ticket fail', async () => {
  vi.spyOn(stripeActions, 'createCheckout').mockRejectedValueOnce(new Error('Checkout failed'));
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(await screen.findByText('Pay Now'))
  expect(await screen.findByText('Status: Unpaid'))
})

it('Challenges ticket', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(await screen.findByText('Challenge Ticket'))
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'any' } })
  fireEvent.click(await screen.findByText('Submit'))
  expect(await screen.findByText('Challenge Pending'))
})