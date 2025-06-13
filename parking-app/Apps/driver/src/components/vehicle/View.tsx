'use client'

import { Box, List, ListItem, Typography, AppBar, Toolbar, Card, CardContent, Fab, IconButton } from "@mui/material"
import Add from "@mui/icons-material/Add"
import { useEffect, useState } from "react"
import { Vehicle, NewVehicle } from "@/vehicle"
import { useTranslations } from "next-intl";
import BottomNavBar from "../BottomNavBar"
import AddVehicleDialog from "./AddVehicle"
import * as VehicleActions from "./actions"
import { AddVehicleContext } from "../../context"
import LoadingCircle from "../Loading"
import NavDrawer from "../NavDrawer"
import Menu from "@mui/icons-material/Menu"
import Avatar from '@mui/material/Avatar';
import logo from '../../../../public/sammypark.png';

export function VehicleView() {
  const [addVehicle, setAddVehicle] = useState<NewVehicle>({plate: '', state: ''})
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [openAddVehicle, setOpenAddVehicle] = useState(false)
  const [shouldAddVehicle, setShouldAddVehicle] = useState(false)
  const [loading, setLoading] = useState(false)
  const [driveAway, setDriveAway] = useState<boolean>(false)
  const t = useTranslations('vehicle')
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleOpenAddVehicle = () => {
    setOpenAddVehicle(true)
  }

  const handleCloseAddVehicle = () => {
    setOpenAddVehicle(false)
  }

  const handleSubmitAddVehicle = () => {
    setOpenAddVehicle(false)
    setShouldAddVehicle(true)
  }

  useEffect(() => {
    if (shouldAddVehicle) {
      VehicleActions.addAction(addVehicle)
      setShouldAddVehicle(false)
    }
    const fetchData = async () => {
      setLoading(true)
      setVehicles(await VehicleActions.listAction())
      setDriveAway(true)
    }
    fetchData()
  }, [shouldAddVehicle, addVehicle])

  return (
    <Box>
      <AddVehicleContext.Provider value={{ setAddVehicle }}>
        <AddVehicleDialog open={openAddVehicle} handleClose={handleCloseAddVehicle} handleSubmit={handleSubmitAddVehicle} />
      </AddVehicleContext.Provider>
      <Box>
        <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#003c6c' }}>
          <Toolbar>
            <Avatar
              alt="sammyparks"
              src={logo.src}
              sx={{ marginRight: 1 }}
            />
            <Typography sx={{ fontFamily: 'Open Sans', flexGrow: 1 }}>
              {t('header')}
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
            setLoading(false)
            setDriveAway(false)
          }}
        />
      :
        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'fixed', top: (theme) => theme.mixins.toolbar.minHeight, bottom: 120, width: '100%', overflowY: 'auto' }}>
          <List sx={{ mt: 1, width: '100%' }} disablePadding>
            {vehicles.length == 0 ?
              <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Typography>No vehicles!</Typography>
              </Box> :
              vehicles.map((vehicle, index) => (
                <ListItem key={index} sx={{ display: 'flex', justifyContent: 'center',width: '100%'}}>
                  <Card variant="outlined" sx={{  width: '50%', aspectRatio: '2/1', borderRadius: 2 }}>
                    <CardContent sx={{position: 'relative',height: '100%',width: '100%',p: 0,}}>
                      <Typography sx={{fontSize: 15, position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', textAlign: 'center'}}>
                        {vehicle.state}
                      </Typography>
                      <Typography variant="h5" color="darkblue" sx={{position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', textAlign: 'center'}}>
                        {vehicle.plate}
                      </Typography>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
          </List>
        </Box>
      }
      <Fab aria-label='add vehicle' onClick={handleOpenAddVehicle} sx={{ position: 'fixed', bottom: 50, right: 0, m: 2, backgroundColor: '#003c6c', color: 'white', '&:hover': { backgroundColor: '#fdc700' } }}>
        <Add />
      </Fab>
      <BottomNavBar />
    </Box>
  )
}

export default VehicleView