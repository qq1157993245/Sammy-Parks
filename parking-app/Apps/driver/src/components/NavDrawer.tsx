import { Drawer, Toolbar, Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material"
import { useTranslations } from "next-intl";
import { useRouter } from 'next/navigation'

interface NavDrawerProps {
  open: boolean;
  handleClose: () => void;
}

export function NavDrawer({ open, handleClose }: NavDrawerProps){
  const router = useRouter()
  const t = useTranslations("nav")

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Toolbar />
      <Box sx={{ width: 150 }} onClick={handleClose}>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => {router.push('/'); handleClose()}}>
              <ListItemText primary={t("permits")} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => {router.push('/vehicles'); handleClose()}}>
              <ListItemText primary={t("vehicles")} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => {router.push('/tickets'); handleClose()}}>
              <ListItemText primary={t("tickets")} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default NavDrawer
