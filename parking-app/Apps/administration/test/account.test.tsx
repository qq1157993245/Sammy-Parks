import { render, fireEvent, waitFor } from '@testing-library/react';
import AccountsView from '../src/components/AccountsView';
import { describe, it, expect, vi } from 'vitest';
import type { Driver, Enforcer } from './types';
import { NextIntlClientProvider } from 'next-intl';

const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'Test Driver Active',
    email: 'driver@example.com',
    suspended: false,
    status: 'active'
  },
  {
    id: 'driver-2',
    name: 'Test Driver Suspended',
    email: 'driver2@example.com',
    suspended: true,
    status: 'suspended'
  }
];

const mockEnforcers: Enforcer[] = [
  {
    id: 'enforcer-1',
    name: 'Test Enforcer Suspended',
    email: 'enforcer@example.com',
    suspended: true,
    status: 'suspended'
  },
  {
    id: 'enforcer-2',
    name: 'Test Enforcer Active',
    email: 'enforcer2@example.com',
    suspended: false,
    status: 'active'
  }
];

describe('AccountsView UI', () => {
  it('renders driver and enforcer sections and toggles', async () => {
    const toggleStatus = vi.fn();

    const { getByText, getByLabelText } = render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          administration: {
            driver: 'Drivers',
            enforcement: 'Enforcers',
            status: 'Status',
            suspend: 'Suspend',
            activate: 'Activate',
            'driver-account': 'Drivers',
            'enforcer-account': 'Enforcers'
          }
        }}
      >
        <AccountsView
          drivers={mockDrivers}
          enforcers={mockEnforcers}
          isPending={false}
          toggleStatus={toggleStatus}
        />
      </NextIntlClientProvider>
    );

    await waitFor(() => {
      expect(getByText(/Drivers/i)).toBeTruthy();
      expect(getByText(/Enforcers/i)).toBeTruthy();

      fireEvent.click(getByLabelText('toggle-driver-driver-1'));
      fireEvent.click(getByLabelText('toggle-driver-driver-1'));
      expect(toggleStatus).toHaveBeenCalledWith('driver-1', 'active', 'driver');

      fireEvent.click(getByLabelText('toggle-enforcer-enforcer-1'));
      fireEvent.click(getByLabelText('toggle-enforcer-enforcer-1'));
      expect(toggleStatus).toHaveBeenCalledWith('enforcer-1', 'suspended', 'enforcer');
    });
  });
});