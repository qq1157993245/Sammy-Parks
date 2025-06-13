import { it, afterEach, vi, expect, beforeAll} from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'

import Page from '../../src/app/[locale]/tickets/page'

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

vi.mock('../../src/components/stripe/actions', async () => {
  return {
    createCheckout: vi.fn(async () => {
      return 'https://stripe.com/checkout/session_id';
    }),
  }
})

vi.mock('../../src/components/ticket/actions', async () => {
  return {
    fetchTicketsForCurrentDriver: vi.fn(),
    challengeTicketForCurrentDriver: vi.fn()
  }
})

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    useSearchParams: () => ({
      get: (key: string) => {
        if (key === 'session_id') return 'session_id';
        if (key === 'type') return 'type';
        if (key === 'vehicle') return 'vehicle';
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

it('Renders', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Tickets'))
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

it('Displays ticket reason', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.findByText(/No Permit/))
})

it('Displays ticket price', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.findByText((content) => content.includes('$20')))
})

it('Displays multiple tickets', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false}},
    {id: 2, data: {violation: 'Expired Permit', price: '50', paid: false}},
    {id: 3, data: {violation: 'No Permit', price: '20', paid: false}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.findByText(/Expired Permit/))
})

it('Displays unpaid ticket status', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.findByText('Status: Unpaid'))
})

it('Displays paid ticket status', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: true}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.findByText('Status: Paid'))
})

it('Displays challenged ticket', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false, challenged: true, challengeAccepted: false}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.findByText('Challenge Pending'))
})

it('Displays accepted challenge', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false, challenged: true, challengeAccepted: true}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.findByText('Challenge Accepted'))
})

it('Displays denied challenge', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false, challenged: true, challengeAccepted: false, challengeDenied: true}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.findByText('Challenge Denied'))
})

it('Challenge ticket dialog appears', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false, challenged: false, challengeAccepted: false, challengeDenied: false}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  fireEvent.click(await screen.findByText('Challenge Ticket'))
  expect(await screen.findByLabelText('Reason'));
})

it('Close challenge ticket dialog', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false, challenged: false, challengeAccepted: false, challengeDenied: false}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  fireEvent.click(await screen.findByText('Challenge Ticket'))
  fireEvent.click(await screen.findByText('Cancel'))
  expect(await !screen.findByLabelText('Reason'));
})

it('Submit challenge', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false, challenged: false, challengeAccepted: false, challengeDenied: false}},
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  fireEvent.click(await screen.findByText('Challenge Ticket'));
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'any' } })
  fireEvent.click(await screen.findByText('Submit'))
  expect(await screen.findByText('Challenge Pending'))
})

it('Challenge only changes one ticket', async () => {
  const { fetchTicketsForCurrentDriver } = await import('../../src/components/ticket/actions');
  vi.mocked(fetchTicketsForCurrentDriver).mockResolvedValue([
    {id: 1, data: {violation: 'No Permit', price: '20', paid: false, challenged: false, challengeAccepted: false, challengeDenied: false}},
    {id: 2, data: {violation: 'Permit Expired', price: '30', paid: false, challenged: false, challengeAccepted: false, challengeDenied: false}}
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  const challengeButtons = await screen.findAllByText('Challenge Ticket');
  fireEvent.click(challengeButtons[0])
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'any' } })
  fireEvent.click(await screen.findByText('Submit'))
  expect(await screen.findByText('Challenge Ticket'))
})
