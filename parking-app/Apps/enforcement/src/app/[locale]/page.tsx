import React from 'react'
import { Fragment } from 'react'
import { Box } from '@mui/material';

import EnforcementView from '@/components/enforcement/EnforcementView'
import LocaleSwitcher from '@/components/LocaleSwitcher'

export default function Page() {
  return (
    <Fragment>
      <Box sx={{position: 'fixed', bottom: '0px', left: '0px', zIndex: 2000}}>
        <LocaleSwitcher />
      </Box>
      <EnforcementView />
    </Fragment>
  )
}
