import React from 'react'
import { Fragment } from 'react'
import LoginClient from '@/components/login/LoginClient'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import { Box } from '@mui/material';

export default function Page() {
  return (
    <Fragment>
      <Box sx={{position: 'fixed', bottom: '0px', left: '0px', zIndex: 2000}}>
        <LocaleSwitcher />
      </Box>
      <LoginClient/>
    </Fragment>
  )
}
