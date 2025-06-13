'use client';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Box,
  CssBaseline,
  AppBar,
  Typography,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
// import IconButton from '@mui/material/IconButton';
import { logout } from './login/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AccountsView from './AccountsView';
import TicketView from './TicketView';
import PermitView from './PermitView';
import type { Driver, Enforcer, Ticket, TicketType, Vehicle } from './admin/types';

const drawerWidth = 240;

interface Props {
  drivers: Driver[];
  enforcers: Enforcer[];
  tickets: Ticket[];
  ticketTypes: TicketType[];
  zonePermits: Record<string, { current: number | null; newLimit: number }>;
  setZonePermits: React.Dispatch<
    React.SetStateAction<
      Record<string, { current: number | null; newLimit: number }>
    >
  >;
  fees: number[];
  setFees: React.Dispatch<React.SetStateAction<number[]>>;
  isPending: boolean;
  toggleStatus: (
    id: string,
    status: 'active' | 'suspended',
    type: 'driver' | 'enforcer'
  ) => void;
  handleSetPrice: (id: string, price: number) => void;
  handleOverride: (id: string) => void;
  handleResolveChallenge: (id: string, accept: boolean) => void;
  updateZoneMaxPermits: (zone: string, limit: number) => Promise<boolean>;
  vehicles: Record<string, Vehicle>;
}

export default function MenuDrawer(props: Props) {
  const [selectedView, setSelectedView] = useState('Accounts');

  const router = useRouter();

  const logoutUser = async () => {
    await logout();
    router.push('/login');
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'Accounts':
        return (
          <AccountsView
            drivers={props.drivers}
            enforcers={props.enforcers}
            isPending={props.isPending}
            toggleStatus={props.toggleStatus}
          />
        );
      case 'Tickets':
        return (
          <TicketView
            ticketTypes={props.ticketTypes}
            fees={props.fees}
            setFees={props.setFees}
            handleSetPrice={props.handleSetPrice}
            ticketList={props.tickets}
            isPending={props.isPending}
            handleOverride={props.handleOverride}
            handleResolveChallenge={props.handleResolveChallenge}
            vehicles={props.vehicles}
            enforcers={props.enforcers}
          />
        );
      case 'Permits':
        return (
          <PermitView
            zones={['A', 'MC', 'R']}
            zonePermits={props.zonePermits}
            setZonePermits={props.setZonePermits}
            updateZoneMaxPermits={props.updateZoneMaxPermits}
            isPending={props.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            {selectedView}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flexGrow: 1 }}>
            <List>
              {['Accounts', 'Tickets', 'Permits'].map((text) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton
                    sx={{
                      py: 2,
                      px: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& .MuiListItemText-primary': {
                        fontSize: '1.1rem',
                        fontWeight: 500,
                      },
                    }}
                    onClick={() => setSelectedView(text)}
                  >
                    <ListItemText primary={text} sx={{ textAlign: 'center', width: '100%' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          <Box sx={{ mb: 2 }}>
            <List>
              <ListItem key="Logout" disablePadding>
                <ListItemButton
                  sx={{
                    py: 2,
                    px: 3,
                    borderRadius: '8px',
                    mx: 5,
                    backgroundColor: '#f44336',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      backgroundColor: '#d32f2f',
                    },
                    '& .MuiListItemText-primary': {
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    },
                  }}
                  onClick={logoutUser}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Logout sx={{ marginRight: 1, color: '#fff' }} />
                    <ListItemText primary="Logout" sx={{ textAlign: 'center' }} />
                  </Box>
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}