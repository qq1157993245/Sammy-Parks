import { it, afterEach, vi, expect, beforeAll } from 'vitest'
import { render, cleanup, screen, waitFor, act } from '@testing-library/react'
import React from 'react'

import AdministrationView from '../src/components/admin/View'
import { Driver, Enforcer, Ticket } from '../src/components/admin/types'


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lastToggleStatus: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lastHandleOverride: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lastHandleResolveChallenge: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lastHandleSetPrice: any = null

vi.mock('../src/components/MenuDrawer', () => ({
  __esModule: true,
  default: (props: any) => {
    lastHandleOverride = props.handleOverride
    lastToggleStatus = props.toggleStatus
    lastHandleResolveChallenge = props.handleResolveChallenge
    lastHandleSetPrice = props.handleSetPrice
    return (
      <div>
        <div>Drivers: {props.drivers.length}</div>
        <div>Enforcers: {props.enforcers.length}</div>
        <div>Tickets: {props.tickets.length}</div>
        <div>ZonePermits: {Object.keys(props.zonePermits).join(',')}</div>
        <div>Vehicles: {Object.keys(props.vehicles).join(',')}</div>
        {props.tickets.map((t: any) => (
          <div key={t.id}>Overridden: {String(t.data.overridden)}</div>
        ))}
        {props.tickets.map((t: any) => (
          <div key={t.id}>
            Challenged: {String(t.data.challenged)} | ChallengeMessage: {t.data.challengeMessage}
          </div>
        ))}
        {props.ticketTypes.map((type: any) => (
          <div key={type.id}>
            TicketType: {type.id} | Violation: {type.violation} | Price: {type.price}
          </div>
        ))}
      </div>
    )
  },
}))

vi.mock('../src/components/admin/actions', () => ({
  toggleDriverAccount: vi.fn(),
  toggleEnforcerAccount: vi.fn(),
  overrideTicketAction: vi.fn(() => Promise.resolve()),
  listTypesAction: vi.fn(() => Promise.resolve([{ id: 'type1', violation: 'Test Violation', price: 10 }])),
  updateZoneMaxPermits: vi.fn(),
  fetchZoneMaxPermits: vi.fn(() => Promise.resolve(100)),
  resolveChallengeAction: vi.fn(() => Promise.resolve()),
  setPriceAction: vi.fn(() => Promise.resolve({ price: 20 })),
  getVehicleByDriverIdForAdmin: vi.fn(() => Promise.resolve({ plate: 'ABC123', id: 'driver1', state: 'CA' })),
}))

const driverAccounts: Driver[] = [
  {
    id: 'driver1',
    name: 'Driver One',
    status: 'active',
    email: 'driver1@example.com',
    suspended: false
  }
]
const enforcementAccounts: Enforcer[] = [
  {
    id: 'enforcer1',
    name: 'Ethan Enforcer',
    email: 'enforcer1@example.com',
    suspended: false,
    status: 'active',
  }
]
const tickets: Ticket[] = [
  {
    id: 'ticket1',
    data: {
      driverId: 'driver123',
      driverName: 'Sammy Park',
      violation: 'No Permit',
      overridden: false,
      paid: false,
      amount: 50,
      issuedBy: 'Officer Jane',
      createdAt: '2024-06-06T12:00:00Z',
      challenged: false,
      challengeMessage: '',
      challengeDenied: false,
    },
  },
  {
    id: 'ticket2',
    data: {
      driverId: undefined as unknown as string,
      driverName: 'Sammy Parasdfsadfk',
      violation: 'No Permit bruyh',
      overridden: false,
      paid: false,
      amount: 50,
      issuedBy: 'Officer Jane',
      createdAt: '2024-06-06T12:00:00Z',
      challenged: false,
      challengeMessage: '',
      challengeDenied: false,
    },
  }
]

it('renders AdministrationView and passes correct props to MenuDrawer', async () => {
  render(
    <AdministrationView
      driverAccounts={driverAccounts}
      enforcementAccounts={enforcementAccounts}
      tickets={tickets}
    />
  )

  await waitFor(() => {
    expect(screen.getByText(/ZonePermits/))
  })
})

it('fetchZoneMaxPermits does not return a number', async () => {
  const { fetchZoneMaxPermits } = await import('../src/components/admin/actions');
  vi.mocked(fetchZoneMaxPermits).mockImplementationOnce(async () => null);

  render(
    <AdministrationView
      driverAccounts={driverAccounts}
      enforcementAccounts={enforcementAccounts}
      tickets={tickets}
    />
  )

  await waitFor(() => {
    expect(screen.getByText(/ZonePermits/))
  })
})


it('No vehicle is returned', async () => {
  const { getVehicleByDriverIdForAdmin } = await import('../src/components/admin/actions');
  vi.mocked(getVehicleByDriverIdForAdmin).mockImplementationOnce(async () => null);

  render(
    <AdministrationView
      driverAccounts={driverAccounts}
      enforcementAccounts={enforcementAccounts}
      tickets={tickets}
    />
  )

  await waitFor(() => {
    expect(screen.getByText(/ZonePermits/))
  })
})

it('Getting vehicle throws an error', async () => {
  const { getVehicleByDriverIdForAdmin } = await import('../src/components/admin/actions');
  vi.mocked(getVehicleByDriverIdForAdmin).mockImplementationOnce(async () => {
    throw new Error('Failed to fetch vehicle');
  });

  render(
    <AdministrationView
      driverAccounts={driverAccounts}
      enforcementAccounts={enforcementAccounts}
      tickets={tickets}
    />
  )

  await waitFor(() => {
    expect(screen.getByText(/ZonePermits/))
  })
})

it('toggles driver status and calls toggleDriverAccount', async () => {
  const { toggleDriverAccount } = await import('../src/components/admin/actions');

  render(
    <AdministrationView
      driverAccounts={driverAccounts}
      enforcementAccounts={enforcementAccounts}
      tickets={tickets}
    />
  );

  act(() => {
    lastToggleStatus('driver1', 'suspended', 'driver')
    lastToggleStatus('driver2', 'active', 'driver')
    lastToggleStatus('enforcer1', 'active', 'enforcer')
    lastToggleStatus('enforcer2', 'suspended', 'enforcer')
  });
  expect(toggleDriverAccount).toHaveBeenCalledWith('driver1', true);
})

it('calls handleOverride and updates ticket overridden status', async () => {
  const { overrideTicketAction } = await import('../src/components/admin/actions')

  render(
    <AdministrationView
      driverAccounts={driverAccounts}
      enforcementAccounts={enforcementAccounts}
      tickets={tickets}
    />
  )

  await act(async () => {
    await lastHandleOverride('ticket1')
    await lastHandleOverride('banana')
  })

  expect(overrideTicketAction).toHaveBeenCalledWith('ticket1')
})

it('calls handleResolveChallenge and updates ticket challenged status', async () => {
  const { resolveChallengeAction } = await import('../src/components/admin/actions');

  render(
    <AdministrationView
      driverAccounts={driverAccounts}
      enforcementAccounts={enforcementAccounts}
      tickets={[
        {
          id: 'ticket1',
          data: {
            driverId: 'driver123',
            driverName: 'Sammy Park',
            violation: 'No Permit',
            overridden: false,
            paid: false,
            amount: 50,
            issuedBy: 'Officer Jane',
            createdAt: '2024-06-06T12:00:00Z',
            challenged: true,
            challengeMessage: 'Please review',
            challengeDenied: false,
          },
        },
      ]}
    />
  )

  await act(async () => {
    await lastHandleResolveChallenge('ticket1', true);
    await lastHandleResolveChallenge('banana', true);
  })
  expect(resolveChallengeAction).toHaveBeenCalledWith('ticket1', true);
})

it('calls handleSetPrice and updates ticket type price', async () => {
  const { setPriceAction } = await import('../src/components/admin/actions');
  vi.mocked(setPriceAction).mockImplementationOnce(async () => ({
    id: 'type1',
    violation: 'Test Violation',
    price: 123
  }))
  const ticketTypes = [
    { id: 'type1', violation: 'Test Violation', price: 10 }
  ]

  render(
    <AdministrationView
      driverAccounts={driverAccounts}
      enforcementAccounts={enforcementAccounts}
      tickets={tickets}
    />
  )

  await act(async () => {
    await lastHandleSetPrice('type1', 122)
    await lastHandleSetPrice('type2', 123)
  })

  // Assert the action was called
  expect(setPriceAction).toHaveBeenCalledWith('type1', 122)
})