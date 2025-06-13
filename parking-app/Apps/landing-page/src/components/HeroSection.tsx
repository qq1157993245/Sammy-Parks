'use client'

import { Box, Typography } from '@mui/material'
import React, { useRef } from 'react'
import SimpleCard from './Card'
import { useTextContext } from '@/context/context'
import { useRouter } from 'next/navigation'
export default function HeroSection() {

    const {isSmallScreen} = useTextContext();

    const router = useRouter();

    const cardSectionRef = useRef<HTMLDivElement>(null);
    const {scrollRef} = useTextContext();

    // const handleScrollToCards = () => {
    //     cardSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    // };

    function handleLogin () {
        router.push('/driver/login');
    }

    function handleRegisterVehicle () {
        router.push('/driver/vehicles');
    }

    function handleBuyPermit () {
        router.push('/driver');
    }

  return (
    <Box 
        aria-label='hero section'
        ref={scrollRef}
        sx={{mt: 2, height: '100%'}}
    >
        <Box 
            aria-label='image'
            sx={{
                position: 'relative',
                borderRadius: '20px',
                display: 'flex',
                justifyContent: isSmallScreen ? 'center' : '',
                alignItems: 'center',
                height: isSmallScreen ? '50%' : '85%',
                backgroundImage: 'url(/banner.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    borderRadius: '20px',
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0, 0, 0, 0.06)', // layer
                    zIndex: 1,
                }}
            />

            <Box 
                sx={
                    isSmallScreen ? {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        zIndex: 2,
                    } : 
                    {
                        zIndex: 2
                    }
                }
            >
                <Typography 
                    variant='h4' 
                    sx={{
                        color: 'white', 
                        fontFamily: 'var(--font-poppins)',
                        fontWeight: '600',
                        textShadow: '1px 1px 6px rgba(0,0,0,0.7)',
                    }}
                >
                    Easy Park 
                </Typography>

                {isSmallScreen && 
                    <Typography 
                        sx={{
                            color: 'white',
                            mt: 1,
                            lineHeight: 1.5,
                            textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
                        }}
                    >
                        Your hassle-free solution for campus parking.
                    </Typography>
                }

                {!isSmallScreen && 
                    <Box>
                        <Typography 
                            sx={{
                                color: 'white',
                                mt: 1,
                                lineHeight: 1.5,
                                textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
                            }}
                        >
                            Your hassle-free solution for campus parking.
                        </Typography>
                        <Typography 
                            sx={{
                                color: 'white',
                                mt: 1,
                                lineHeight: 1.5,
                                textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
                            }}
                        >
                            Find permits, manage your vehicle, and avoid tickets—all in one place!
                        </Typography>
                    </Box>
                }
                {/* <Button
                    aria-label='get started'
                    onClick={handleScrollToCards}
                    variant='contained'
                    size="small" 
                    sx={{
                        marginTop: '10px', 
                        borderRadius: '10px',
                        padding: '10px 60px',
                        fontSize: '15px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#4FC122'
                    }}
                >
                    Get Started
                </Button> */}
            </Box>
        </Box>

        <Box ref={cardSectionRef} sx={{overflowX: 'hidden'}}>
            <SimpleCard 
                title='Account login' 
                description='Sign in to your Sammyparks account'
                action='Log In Now'
                event={handleLogin}
                img='/image1.jpg'
            />
            <SimpleCard 
                title='Register Your Vehicle' 
                description='Register your vehicle before you buy a permit'
                action='Register Now'
                event={handleRegisterVehicle}
                img='/image2.jpg'
            />
            <SimpleCard 
                title='Purchase A Permit' 
                description='Buy a permit for your registered vehicle'
                action='Start Purchasing'
                event={handleBuyPermit}
                img='/image3.jpg'
            />
        </Box>
    </Box>
  )
}
