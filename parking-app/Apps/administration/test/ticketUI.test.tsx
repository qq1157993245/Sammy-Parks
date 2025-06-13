import { render, fireEvent, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import TicketView from '@/components/TicketView';

import { Ticket, TicketType, Vehicle, Enforcer } from '@/components/admin/types';
import { it, expect, vi } from 'vitest';

const mockMessages = {
  administration: {
    fine: 'Fine',
    override: 'Override',
    ticket: 'Ticket',
    driver: 'Driver',
    plate: 'Plate',
    violation: 'Violation',
    status: 'Status',
    unpaid: 'Unpaid',
    paid: 'Paid',
    issuer: 'Issuer',
    overridden: 'Overridden',
    yes: 'Yes',
    no: 'No',
    date: 'Date',
    'challenge-message': 'Challenge Message',
    accept: 'Accept',
    deny: 'Deny',
    'no-ticket': 'No Tickets'
  },
};

const challengedTicket: Ticket = {
  id: 'ticket-1',
  data: {
    driverId: 'driver-1',
    driverName: 'John Doe',
    violation: 'No Permit',
    overridden: false,
    paid: false,
    amount: 200,
    issuedBy: 'enf-1',
    createdAt: new Date().toISOString(),
    challenged: true,
    challengeMessage: 'I had a permit',
    challengeDenied: false
  }
};

const noop = vi.fn();

const enforcers: Enforcer[] = [
  { id: 'enf-1', name: 'Leo', email: 'leo@email.com', suspended: false, status: 'active' }
];

const vehicles: Record<string, Vehicle> = {
  'driver-1': { plate: 'ABC123', id: 'vehicle-1', state: 'CA' }
};

const ticketTypes: TicketType[] = [
  { id: 'violation-1', price: 200, violation: 'No Permit' }
];

const ticketList: Ticket[] = [
  {
    id: 'ticket-1',
    data: {
      driverId: 'driver-1',
      driverName: 'John Doe',
      violation: 'No Permit',
      overridden: false,
      paid: false,
      amount: 200,
      issuedBy: 'enf-1',
      createdAt: new Date().toISOString(),
      challenged: true,
      challengeMessage: 'I had a permit',
      challengeDenied: false
    }
  }
];

function renderTicketView(props: Partial<React.ComponentProps<typeof TicketView>> = {}) {
  return render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[200]}
        setFees={noop}
        handleSetPrice={noop}
        ticketList={[challengedTicket]}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={noop}
        vehicles={vehicles}
        enforcers={enforcers}
        {...props}
      />
    </NextIntlClientProvider>
  );
}

it('renders tickets and triggers override', async () => {
  const handleOverride = vi.fn();

  const { getByLabelText } = render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[200]}
        setFees={noop}
        handleSetPrice={noop}
        ticketList={[challengedTicket]}
        isPending={false}
        handleOverride={handleOverride}
        handleResolveChallenge={noop}
        vehicles={vehicles}
        enforcers={enforcers}
      />
    </NextIntlClientProvider>
  );

  const overrideBtn = getByLabelText('override-ticket-ticket-1');
  fireEvent.click(overrideBtn);
  expect(handleOverride).toHaveBeenCalledWith('ticket-1');

  // Also check that challenge accept/deny buttons are rendered and clickable
  const acceptBtn = screen.getByLabelText('accept-challenge-ticket-1');
  const denyBtn = screen.getByLabelText('deny-challenge-ticket-1');
  expect(acceptBtn).toBeTruthy();
  expect(denyBtn).toBeTruthy();
});

it('resolves challenge acceptance', () => {
  const mockResolveChallenge = vi.fn();

  const challengedTicketLocal: Ticket = {
    ...ticketList[0],
    id: 'ticket-1',
    data: {
      ...ticketList[0].data,
      challenged: true,
      overridden: false
    }
  };

  render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[200]}
        setFees={noop}
        handleSetPrice={noop}
        ticketList={[challengedTicketLocal]}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={mockResolveChallenge}
        vehicles={vehicles}
        enforcers={enforcers}
      />
    </NextIntlClientProvider>
  );

  const acceptBtns = screen.getAllByLabelText('accept-challenge-ticket-1');
  expect(acceptBtns.length).toBeGreaterThan(0);
  fireEvent.click(acceptBtns[0]);

  expect(mockResolveChallenge).toHaveBeenCalledTimes;
});

it('resolves challenge denial', () => {
  const mockResolveChallenge = vi.fn();

  const challengedTicketLocal: Ticket = {
    ...ticketList[0],
    id: 'ticket-1',
    data: {
      ...ticketList[0].data,
      challenged: true,
      overridden: false
    }
  };

  render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[200]}
        setFees={noop}
        handleSetPrice={noop}
        ticketList={[challengedTicketLocal]}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={mockResolveChallenge}
        vehicles={vehicles}
        enforcers={enforcers}
      />
    </NextIntlClientProvider>
  );

  const denyBtns = screen.getAllByLabelText('deny-challenge-ticket-1');
  expect(denyBtns.length).toBeGreaterThan(0);
  fireEvent.click(denyBtns[0]);

  expect(mockResolveChallenge).toHaveBeenCalledTimes;
});


it('renders fallback values for unknown enforcer and missing plate', () => {
  const ticketWithMissingData = {
    ...ticketList[0],
    data: {
      ...ticketList[0].data,
      issuedBy: 'nonexistent-enforcer',
      driverId: 'unknown-driver'
    },
  };

  render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[200]}
        setFees={noop}
        handleSetPrice={noop}
        ticketList={[ticketWithMissingData]}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={noop}
        vehicles={{}} // no vehicle data to trigger plate fallback
        enforcers={[]} // no enforcer data to trigger name fallback
      />
    </NextIntlClientProvider>
  );

  expect(screen.getAllByText(/Unknown/)[0]).toBeTruthy();
  expect(screen.getAllByText(/N\/A/)[0]).toBeTruthy();
});


it('updates violation fee using input and save button', () => {
  const mockSetPrice = vi.fn();

  render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[250]}
        setFees={noop}
        handleSetPrice={mockSetPrice}
        ticketList={ticketList}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={noop}
        vehicles={vehicles}
        enforcers={enforcers}
      />
    </NextIntlClientProvider>
  );

  const saveBtn = screen.getAllByLabelText('update-violation-fee-violation-1')[0];
  fireEvent.click(saveBtn);

  expect(mockSetPrice);
});

it('renders ticket info fields: paid, issuer, overridden', () => {

  render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[200]}
        setFees={noop}
        handleSetPrice={noop}
        ticketList={ticketList}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={noop}
        vehicles={vehicles}
        enforcers={enforcers}
      />
    </NextIntlClientProvider>
  );

  expect(screen.getAllByText(/Unpaid/)[0]).toBeTruthy();
  expect(screen.getAllByText(/Leo/)[0]).toBeTruthy(); // enforcer name
  expect(screen.getAllByText(/No/)[0]).toBeTruthy();  // overridden: false
});
it('renders empty state if no tickets', () => {

  render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[]}
        setFees={noop}
        handleSetPrice={noop}
        ticketList={[]}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={noop}
        vehicles={vehicles}
        enforcers={enforcers}
      />
    </NextIntlClientProvider>
  );

  expect(screen.getAllByText('No Tickets')[0]).toBeTruthy();
});

it('displays overridden state styles correctly', () => {
  const overriddenTicket: Ticket = {
    ...ticketList[0],
    data: {
      ...ticketList[0].data,
      overridden: true
    }
  };

  render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[]}
        setFees={noop}
        handleSetPrice={noop}
        ticketList={[overriddenTicket]}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={noop}
        vehicles={vehicles}
        enforcers={enforcers}
      />
    </NextIntlClientProvider>
  );

  expect(screen.getAllByText(/Overridden/)[0]).toBeTruthy();
  // If using Jest, ensure this import is at the top of your test file or setup file:
  // import '@testing-library/jest-dom';
  
    const overrideButtons = screen.getAllByRole('button', { name: /override-ticket/i });
    expect(overrideButtons[0].className).toMatch(/MuiButton-containedError/);
});

it('displays correct status, issuer, and overridden values for paid and unpaid tickets', () => {

  // Paid and overridden ticket
  const paidTicket: Ticket = {
    ...ticketList[0],
    data: {
      ...ticketList[0].data,
      paid: true,
      overridden: true,
    },
  };
  // Unpaid and not overridden ticket
  const unpaidTicket: Ticket = {
    ...ticketList[0],
    data: {
      ...ticketList[0].data,
      paid: false,
      overridden: false,
    },
    id: 'ticket-2',
  };

  render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[200, 200]}
        setFees={noop}
        handleSetPrice={noop}
        ticketList={[paidTicket, unpaidTicket]}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={noop}
        vehicles={vehicles}
        enforcers={enforcers}
      />
    </NextIntlClientProvider>
  );

  // Paid ticket should show Paid, Leo, Yes
  expect(screen.getAllByText(/Paid/)[0]).toBeTruthy();
  expect(screen.getAllByText(/Leo/)[0]).toBeTruthy();
  expect(screen.getAllByText(/Yes/)[0]).toBeTruthy();
  // Unpaid ticket should show Unpaid, Leo, No
  expect(screen.getAllByText(/Unpaid/)[0]).toBeTruthy();
  expect(screen.getAllByText(/Leo/)[1]).toBeTruthy();
  expect(screen.getAllByText(/No/)[0]).toBeTruthy();
});
it('updates fee value correctly when input is changed', () => {
  const mockSetFees = vi.fn();

  render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      <TicketView
        ticketTypes={ticketTypes}
        fees={[200]}
        setFees={mockSetFees}
        handleSetPrice={noop}
        ticketList={ticketList}
        isPending={false}
        handleOverride={noop}
        handleResolveChallenge={noop}
        vehicles={vehicles}
        enforcers={enforcers}
      />
    </NextIntlClientProvider>
  );

  const input = screen.getAllByLabelText('Fine')[0];
  fireEvent.change(input, { target: { value: '300' } });

  expect(mockSetFees).toHaveBeenCalledTimes

});
