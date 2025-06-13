import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuDrawer from '../src/components/MenuDrawer';

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    Drawer: (props: any) => <div>{props.children}</div>,
    AppBar: (props: any) => <div>{props.children}</div>,
    Toolbar: (props: any) => <div>{props.children}</div>,
    Typography: (props: any) => <div>{props.children}</div>,
    CssBaseline: () => null,
    Box: (props: any) => <div>{props.children}</div>,
    List: (props: any) => <ul>{props.children}</ul>,
    ListItem: (props: any) => <li>{props.children}</li>,
    ListItemButton: (props: any) => <button onClick={props.onClick}>{props.children}</button>,
    ListItemText: (props: any) => <span>{props.primary}</span>,
  };
});

vi.mock('@mui/icons-material', () => ({
  Logout: () => <div>LogoutIcon</div>,
}));

vi.mock('../src/components/AccountsView', () => ({
  default: () => <div>Mocked AccountsView</div>,
}));
vi.mock('../src/components/TicketView', () => ({
  default: () => <div>Mocked TicketView</div>,
}));
vi.mock('../src/components/PermitView', () => ({
  default: () => <div>Mocked PermitView</div>,
}));
vi.mock('../src/components/login/actions', () => ({
  logout: vi.fn(),
}));
const defaultProps = {
  drivers: [],
  enforcers: [],
  tickets: [],
  ticketTypes: [],
  zonePermits: {},
  setZonePermits: vi.fn(),
  fees: [],
  setFees: vi.fn(),
  isPending: false,
  toggleStatus: vi.fn(),
  handleSetPrice: vi.fn(),
  handleOverride: vi.fn(),
  handleResolveChallenge: vi.fn(),
  updateZoneMaxPermits: vi.fn(() => Promise.resolve(true)),
  vehicles: {},
};

it('renders AccountsView by default', () => {
  render(<MenuDrawer {...defaultProps} />);
  expect(screen.queryByText('Mocked AccountsView')).not.toBeNull();
});

it('switches to TicketView on click', () => {
  render(<MenuDrawer {...defaultProps} />);
  const ticketsBtn = screen.getAllByRole('button', { name: 'Tickets' })[0];
  fireEvent.click(ticketsBtn);
  expect(screen.queryByText('Mocked TicketView')).not.toBeNull();
});

it('switches to PermitView on click', () => {
  render(<MenuDrawer {...defaultProps} />);
  const permitsBtn = screen.getAllByRole('button', { name: 'Permits' })[0];
  fireEvent.click(permitsBtn);
  expect(screen.queryByText('Mocked PermitView')).not.toBeNull();
});

import * as loginActions from '../src/components/login/actions';

it('calls logout and redirects to /login when logout button is clicked', async () => {
  render(<MenuDrawer {...defaultProps} />);
  const logoutButton = screen.getAllByText('Logout')[0];
  fireEvent.click(logoutButton);
  expect(loginActions.logout).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalled;
});
