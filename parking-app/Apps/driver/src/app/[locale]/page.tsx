'use client'
import type { NextPage } from 'next'
import { Fragment } from 'react'
import PermitView from '@/components/permit/View'

import { SessionProvider } from 'next-auth/react'
import Terms from '@/components/terms/Terms'
const Page: NextPage = () => {
  return (
    <Fragment>
      <SessionProvider>
        <Terms/>
        <PermitView />      
      </SessionProvider>
    </Fragment>
  )
}

export default Page
