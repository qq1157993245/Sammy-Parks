'use client';

import { useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Stack } from '@mui/material';
import Menu from '@mui/icons-material/Menu';

import { Ticket } from '../../ticket/index'
import ViewTickets from './viewTicket';
import NavDrawer from '../NavDrawer';
import BottomNavBar from '@/components/BottomNavBar';
import { fetchTicketsForCurrentDriver, challengeTicketForCurrentDriver } from './actions';
import * as StripeActions from "../stripe/actions"
import { CheckoutItem } from '@/stripe';
import { useTranslations } from 'next-intl';
import LoadingCircle from "../Loading"
import Avatar from '@mui/material/Avatar';
import logo from '../../../../public/sammypark.png';

export default function TicketView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false)
  const [driveAway, setDriveAway] = useState<boolean>(false)
  const t = useTranslations("ticket")

  const handleDrawerToggle = () => {
    setDrawerOpen(prev => !prev);
  };

  
  const isProd = process.env.NODE_ENV === 'production';
  const redirectUrl = isProd ? 'https://sammyparks.com/driver' : 'http://localhost:3050/driver';

  const handlePay = async (ticket: Ticket) => {
    const item: CheckoutItem = {
      productName: `Ticket`,
      currency: 'usd',
      amount: ticket.data.price * 100,
      url: `${redirectUrl}/tickets?paidTicket=${ticket.id}`,
    };
   

    try {
      const stripeUrl = (await StripeActions.createCheckout(item)) as unknown as string;
      window.location.href = stripeUrl;
    } catch (err) {
      alert('Unable to initiate payment.');
      console.error(err);
    }
  };

  const handleChallenge = async (ticket: Ticket, message: string) => {
    await challengeTicketForCurrentDriver(ticket.id, message);
    // Immediately update local ticket state to reflect challenge
    setTickets(prevTickets =>
      prevTickets.map(t =>
        t.id === ticket.id
          ? {
              ...t,
              data: {
                ...t.data,
                challenged: true,
                challengeMessage: message,
                challengeDenied: false,
                challengeAccepted: false,
              },
            }
          : t
      )
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetched = await fetchTicketsForCurrentDriver();
      setTickets(fetched);
      setDriveAway(true);
    };
    fetchData();
  }, []);

  return (
    <Box>
      <Box>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#003c6c' }}>
          <Toolbar>
            <Avatar
              alt="sammyparks"
              src={logo.src}
              sx={{ marginRight: 1 }}
            />
            <Typography sx={{ fontFamily: 'Open Sans', flexGrow: 1 }}>
              {t("header")}
            </Typography>
            <IconButton color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
              <Menu />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
      <NavDrawer open={drawerOpen} handleClose={handleDrawerToggle} />
      { loading ?
        <LoadingCircle
          driveAway={driveAway}
          onDriveEnd={() => {
            setLoading(false);
            setDriveAway(false);
          }}
        />
      :
        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'fixed', top: (theme) => theme.mixins.toolbar.minHeight, bottom: 120, width: '100%', overflowY: 'auto' }}>
          <Stack mt={1}>
            <ViewTickets
              tickets={tickets}
              onPay={handlePay}
              onChallenge={handleChallenge}
            />
          </Stack>
        </Box>  
      }
      <BottomNavBar />
    </Box>
  );
}
