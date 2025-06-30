'use client' 
import { Box, AppBar, Toolbar, Typography, Avatar, Stack, IconButton, Button } from "@mui/material"
import Menu from '@mui/icons-material/Menu'
import { useEffect, useState } from "react";
import NavDrawer from "../NavDrawer";
import BottomNavBar from "../BottomNavBar";
import { useTranslations } from "next-intl";
import LocaleSwitcher from '@/components/LocaleSwitcher'
import logo from '../../../../public/sammypark.png';
import { getImage, uploadImage } from "./action";

export function ProfileView() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [image, setImage] = useState('');
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const t = useTranslations("profile")

  async function editProfile (event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setImage(imageUrl)
      }
    }
  }

  useEffect(()=>{
    const getData = async () => {
      const imageUrl = await getImage();
      if (imageUrl) {
        setImage(imageUrl)
      }
    }

    getData()
  }, []);

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
          {image ? (
            <a href={image} target="_blank" rel="noopener noreferrer">
              <Avatar
                src={image}
                sx={{ width: 100, height: 100, cursor: "pointer" }}
              />
            </a>
          ) : (
            <Avatar
              sx={{ width: 100, height: 100 }}
            />
          )}
          <Typography sx={{ fontWeight: 'bold', fontSize: 24 }}>
            {window.sessionStorage.getItem('name')}
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{ background: '#015AEB', color: 'white' }}
          >
            {t('edit')}
            <input
              accept="image/*"
              type="file"
              hidden
              onChange={editProfile}
            />
          </Button>
          <LocaleSwitcher />
        </Stack>
      </Box>
      <BottomNavBar />
    </Box>
  )
}

export default ProfileView
