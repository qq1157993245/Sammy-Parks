'use client'
import {useState} from 'react';
import {TextField, Stack, Button, Typography, Box} from '@mui/material';
import Image from 'next/image';
import logo from '../../../../public/logo.jpg';
import { useRouter } from 'next/navigation'
import { useTranslations } from "next-intl";
import {SessionProvider, signIn} from 'next-auth/react'
import { login } from './actions'
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
// import {authOptions} from '@/auth/oauth/nextauth'
/**
 * @returns {*} login
 */
export function LoginView() {
  const [credentials, setCredentials] = useState({email: '', password: ''});
  const [error, setError] = useState('');

  const router = useRouter();

  const t = useTranslations('login')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {value, name} = event.target as HTMLInputElement;
    setCredentials((prev) => ({...prev, [name]: value}));
  };

  const handleClick = async () => {
    const authenticated = await login(credentials)
    if (authenticated) {
      window.sessionStorage.setItem('name', authenticated.name)
      router.push('/')
    } else {
      setError(t('error'))
    }
  }

  const handleClickSignup = async () => {
    router.push('/signup')
  }

  const handleToLandingPage = () => {
    //window.location.href = 'http://localhost:3000';
    window.location.href = 'https://sammyparks.com';
  }

  return (
    <SessionProvider basePath="/driver/api/auth">
    <Stack>
      <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '40vh'}}>
        <Image src={logo} alt="Logo" width={100} height={100} onClick={handleToLandingPage} style={{cursor: 'pointer'}}/>
        <Typography sx={{fontSize: 45, fontWeight: 'bold', cursor: 'pointer'}} onClick={handleToLandingPage}>Sammy Parks.</Typography>
        <Typography sx={{pb: 3, fontFamily: 'Open Sans', fontWeight: 'bold'}}>
          {t('header')}
        </Typography>
      </Box>
      <TextField label={t('email')} name='email'
        variant='outlined' onChange={handleInputChange}/>
      <TextField type='password' label={t('password')} name='password'
        variant='outlined' onChange={handleInputChange} sx={{pb: 1}}/>
      {error && <Typography sx={{color: 'red'}}>{t('error')}</Typography>}
      <Button sx={{background: '#003c6c', color: 'white', bottom: 0,
        left: '25%', right: 0, width: '50%', mt: 2}} onClick={handleClick}>
        {t('submit')}
      </Button>
        <Button
          onClick={() => {
          console.log("Attempting Google sign in...");
          signIn("google", { callbackUrl: "/driver" });
        }}
        variant="outlined"
        startIcon={<FcGoogle />}
        sx={{
          borderRadius: '6px',
          textTransform: 'none',
          padding: '8px',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '68%',
          marginTop: '15px',
          border: '1px solid black',
          color: 'black',
          fontWeight: 600,
          fontSize: '16px',
          backgroundColor: 'white'
        }}
      >
        {t('google')}
      </Button>
      <Typography 
        variant="body2"
        sx={{
          marginTop: '15px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
         {t('newUserPrompt')}{' '}
        <Typography
          component="span"
          onClick={handleClickSignup}
          sx={{
            color: '#3EBD0C',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {t('createAccountPrompt')}
        </Typography>
      </Typography>
    </Stack>
    </SessionProvider>
  );
}

export default LoginView;
