import type { NextPage } from 'next'
import { Fragment } from 'react'
import Box from '@mui/material/Box';

import LocaleSwitcher from '@/components/LocaleSwitcher'
import SignupView from '@/components/signup/View'

const Page: NextPage = () => {
  return (
    <Fragment>
      <Box sx={{position: 'fixed', bottom: '0px', left: '0px', zIndex: 2000}}>
        <LocaleSwitcher />
      </Box>
      <SignupView />
    </Fragment>
  )
}

export default Page
