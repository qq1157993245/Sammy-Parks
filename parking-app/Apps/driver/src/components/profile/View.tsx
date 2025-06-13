'use client' 
import { Box, AppBar, Toolbar, Typography, Avatar, Stack, IconButton } from "@mui/material"
import Menu from '@mui/icons-material/Menu'
import { useState } from "react";
import NavDrawer from "../NavDrawer";
import BottomNavBar from "../BottomNavBar";
import { useTranslations } from "next-intl";
import LocaleSwitcher from '@/components/LocaleSwitcher'
import logo from '../../../../public/sammypark.png';

export function ProfileView() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const t = useTranslations("profile")
  return (
    <Box>
      <Box>
        <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#003c6c' }}>
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
      <Box sx={{ display: 'flex', justifyContent: 'center', position: 'fixed', top: (theme) => (theme.mixins.toolbar.minHeight as number + 10), bottom: 120, width: '100%', overflowY: 'auto' }}>
        <Stack direction="column" spacing={2} alignItems="center" mt={2}>
          <Avatar sx={{ width: 100, height: 100 }} />
          <Stack direction="column" spacing={6} alignItems="center" sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: 24 }}>
              {window.sessionStorage.getItem('name')}
            </Typography>
            <LocaleSwitcher />
          </Stack>
        </Stack>
      </Box>
      <BottomNavBar />
    </Box>
  )
}

export default ProfileView
