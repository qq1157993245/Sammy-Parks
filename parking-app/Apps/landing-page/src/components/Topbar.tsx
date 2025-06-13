'use client'

import React, { useState } from 'react';
import { AppBar, Box, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, Button, ListItemButton} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import { useTextContext } from '@/context/context';


export default function TopBar() {
  const pages = ['Log In', 'Sign Up', 'Register Vehicles', 'Purchase Permits'];

  const [open, setOpen] = useState(false);

  const {isSmallScreen, scrollRef} = useTextContext();

  const router = useRouter();

  const toggleDrawer = (state: boolean) => () => {
    setOpen(state);
  };

  const drawerItems = [
  { text: 'Log In', action: handleLogin },
  { text: 'Sign Up', action: handleSignup },
  { text: 'Register Vehicles', action: handleRegisterVehicle },
  { text: 'Purchase Permits', action: handleBuyPermit },
];

  function handleToHomePage () {
    router.push('/');
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSignup () {
    router.push('/driver/signup');
  }

  function handleLogin () {
    router.push('/driver/login');
  }

  function handleRegisterVehicle () {
    router.push('/driver/vehicles');
  }

  function handleBuyPermit () {
    router.push('/driver');
  }

  return (
    <>
      <AppBar 
        position='fixed'
        aria-label='top bar'
        sx={{ 
            backgroundColor: 'white',
            boxShadow: 'none',
            borderBottom: 'solid',
            borderBottomWidth: '3px',
            borderBottomColor: 'black'
          }}
      >
        <Toolbar disableGutters>
            <Button
                aria-label='title'
                disableRipple
                variant="text" 
                sx={{ 
                    color: 'black',
                    fontSize: {
                      xs: '18px',
                      sm: '20px',
                      md: '24px',
                      lg: '28px' 
                    },
                    mr: 'auto',
                    alignItems: 'center',
                    fontFamily: 'var(--font-poppins)',
                    fontWeight: '600',
                    backgroundColor: 'transparent' ,
                    '&:hover': {
                      color: '#62C83A',
                    }
                }}
                onClick={handleToHomePage}
            >
                <Box
                  component="img"
                  src="/logo.jpg"
                  alt="Logo"
                  sx={{
                    width: {
                      xs: '40px',
                      sm: '44px',
                      md: '47px',
                      lg: '51px' 
                    },
                    height: {
                      xs: '40px',
                      sm: '44px',
                      md: '47px',
                      lg: '51px' 
                    },
                    mb: '10px' 
                  }}
                />
                Sammy Parks
            </Button>

            {!isSmallScreen && 
              <Box 
                sx={{ 
                  flex: 4,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly'
                }}
              >
                {pages.map((page) => (
                  <Button
                    aria-label={page}
                    key={page}
                    onClick={() => {
                      switch (page) {
                        case 'Log In':
                          handleLogin();
                          break;
                        case 'Sign Up':
                          handleSignup();
                          break;
                        case 'Register Vehicles':
                          handleRegisterVehicle();
                          break;
                        case 'Purchase Permits':
                          handleBuyPermit();
                          break;
                      }
                    }}
                    sx={{ 
                      textTransform: 'none',
                      my: 2, 
                      color: 'black', 
                      display: 'block',
                      backgroundColor: 'transparent' ,
                      '&:hover': {
                        color: '#62C83A',
                      },
                    }}
                  >
                    {page}
                  </Button>
                ))}
              </Box>
            }

            {isSmallScreen && 
              <IconButton
                sx={{color: 'black'}}
                edge="start"
                aria-label="menu"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            }
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: '55vw',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >

          <List aria-label='list'>
            {drawerItems.map(({ text, action }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton onClick={action} 
                sx={{
                  '&:hover': {
                    backgroundColor: 'transparent',
                      color: '#62C83A',
                    }
                  }}>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Box component="img" src="/logo.jpg" alt="Logo" sx={{ width: 60, mb: 1 }} />
            <Button
              variant="outlined"
              sx={{
                mt: 1,
                width: '90%',
                borderColor: '#62C83A',
                color: '#62C83A',
                '&:hover': {
                  backgroundColor: '#e6f4ea',
                },
              }}
              onClick={handleLogin}
            >
              Sign In Now
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
