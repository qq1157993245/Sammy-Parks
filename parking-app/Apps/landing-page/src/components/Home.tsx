'use client'


import HeroSection from '@/components/HeroSection'
import TopBar from '@/components/Topbar'
import { Box, Toolbar } from '@mui/material'
import React from 'react'

export default function Home() {
  return (
    <Box 
      aria-label='outer'
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopBar/>
      <Toolbar/>
      <HeroSection/>
    </Box>
  )
}
