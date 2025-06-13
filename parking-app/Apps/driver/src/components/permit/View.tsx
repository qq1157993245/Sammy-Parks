'use client'
import { Box, Typography, AppBar, Toolbar, Button, List, Card, CardContent, ListItem, IconButton, Stack } from '@mui/material'
import Menu from '@mui/icons-material/Menu'
import * as PermitActions from './actions'
import { PermitType, Permit, NewPermit, PermitZone } from '../../permit/index'
import { Vehicle } from "@/vehicle"
import { useState, useEffect } from 'react'
import BottomNavBar from "../BottomNavBar"
import BuyPermit from "../permit/BuyPermit"
import { AddPermitContext } from '@/context'
import * as VehicleActions from "../vehicle/actions"
import * as StripeActions from "../stripe/actions"
import NavDrawer from "../NavDrawer";
import { useSearchParams } from 'next/navigation'
import ErrorAlert from "../Alert"
import LoadingCircle from "../Loading"
import { useTranslations } from 'next-intl'
import Avatar from '@mui/material/Avatar';
import logo from '../../../../public/sammypark.png';
import { useSession } from 'next-auth/react'

export function PermitView() {
  const [permitTypes, setPermitTypes] = useState<PermitType[]>([])
  const [openAddPermit, setOpenAddPermit] = useState(false)
  const [addPermit, setAddPermit] = useState<NewPermit>({typeId: '', zoneTypeId: '', vehicleId: ''})
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [permits, setPermits] = useState<Permit[]>([])
  const [permitZones, setPermitZones] = useState<PermitZone[]>([])
  const [shouldAddPermit, setShouldAddPermit] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen)
  const [alertOccurred, setAlertOccurred] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [driveAway, setDriveAway] = useState<boolean>(false)
  const t = useTranslations("permit")

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const isProd = process.env.NODE_ENV === 'production'
  const redirectUrl = isProd ? 'https://sammyparks.com/driver' : 'http://localhost:3050/driver';
  const sessionId = useSearchParams().get('session_id')
  const typeId = useSearchParams().get('type')
  const vehicleId = useSearchParams().get('vehicle')
  const zoneId = useSearchParams().get('zoneId')

  const { data: session, status} = useSession();

  const handleOpenAddPermit = () => {
    setOpenAddPermit(true)
  }

  const handleCloseAddPermit = () => {
    setOpenAddPermit(false)
  }

  const handleSubmitAddPermit = () => {
    setOpenAddPermit(false)
    setShouldAddPermit(true)
  }

  const checkIfVehicleHasPermit = (vehicleId: string): boolean => {
    return permits.some(permit => permit.vehicleId === vehicleId)
  }

  useEffect(()=>{
    // Store user's name for google account login
    if (status === 'authenticated' && session?.user?.name) {
      window.sessionStorage.setItem('name', session.user.name);
    }
  }, [status, session]);

  useEffect(() => {
    if(shouldAddPermit) {
      const vehicleHasPermit = checkIfVehicleHasPermit(addPermit.vehicleId)
      if (vehicleHasPermit) {
        setShouldAddPermit(false)
        setAlertOccurred(true)
        return
      }

      const selected = permitTypes.find(pt => pt.id === addPermit.typeId)
      StripeActions.createCheckout({
        productName: `${selected?.type} Permit`,
        currency: 'usd',
        amount: (selected?.price ?? 0) * 100,
        url: `${redirectUrl}?type=${addPermit.typeId}&vehicle=${addPermit.vehicleId}&zoneId=${addPermit.zoneTypeId}`
      }).then((url) => {
        window.location.href = url
      })
      setShouldAddPermit(false)
    }
    const fetchData = async () => {
      setLoading(true)
      setPermitTypes(await PermitActions.listTypes())
      setPermitZones(await PermitActions.listZones())
      setPermits(await PermitActions.list())
      setVehicles(await VehicleActions.listAction())
      setDriveAway(true)
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAddPermit, addPermit])

  useEffect(() => {
    const addPermitIfNeeded = async () => {
      const type = typeId
      const vehicle = vehicleId
      const session = sessionId
      const zone = zoneId
      const urlObj = new URL(redirectUrl);
      window.history.replaceState({}, '', urlObj.pathname + urlObj.search);
      if (type && vehicle && session && zone) {
        await PermitActions.add(type, zone, vehicle)
      }
      setPermits(await PermitActions.list())
    }
    addPermitIfNeeded()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, typeId, vehicleId])

  return(
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
          <AddPermitContext.Provider value={{ setAddPermit }}>
            <BuyPermit open={openAddPermit} permitTypes={permitTypes} permitZones={permitZones} vehicles={vehicles} handleClose={handleCloseAddPermit} handleSubmit={handleSubmitAddPermit} />
          </AddPermitContext.Provider>
          <Stack mt={1}>
            <List>
              {permits.length == 0 ?
                <Typography>{t("nopermits")}</Typography> :
                permits.map((permit, index) => (
                  <ListItem key={index}>
                    <Card sx={{ width: '100%', mr: 2 }}>
                      <CardContent>
                        <Typography>
                          {t("vehicle") + ": " + permit.plate}
                        </Typography>
                        <Typography>
                          {t("zone") + ": " + permit.zone}
                        </Typography>
                        <Typography>
                          {t("activefrom") + " " + months[new Date(permit.startTime).getMonth()] + ' ' + new Date(permit.startTime).getDate() + " " + t("to") + " " +
                            months[new Date(permit.endTime).getMonth()] + ' ' + new Date(permit.endTime).getDate()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </ListItem>
                ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'center' }} mt={1}>
              <Button onClick={() => handleOpenAddPermit()}>
                {t("buy")}
              </Button>
            </Box>
          </Stack>
        </Box>
      }
      { alertOccurred &&
        <ErrorAlert
          setAlertOccurred={setAlertOccurred}
          message="That vehicle already has a permit!"
        />
      }
    <BottomNavBar/>
  </Box>
  )
}

export default PermitView
