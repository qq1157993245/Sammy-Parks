import type { NextPage } from 'next'
import { Fragment } from 'react'
import { Box } from '@mui/material';

import LoginView from '@/components/login/View';
import LocaleSwitcher from '@/components/LocaleSwitcher';

const Page: NextPage = () => {
  return (
    <Fragment>
      <Box sx={{position: 'fixed', bottom: '0px', right: '0px', zIndex: 2000}}>
        <LocaleSwitcher />
      </Box>
      <LoginView />
    </Fragment>
  )
}

export default Page
