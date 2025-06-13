'use client'
import {useState} from 'react';
import {TextField, Stack, Button, Typography, Box, Snackbar, Alert} from '@mui/material';
import Image from 'next/image';
import logo from '../../../../public/logo.jpg';
import { useRouter } from 'next/navigation'
import { useTranslations } from "next-intl";
import {SessionProvider} from 'next-auth/react'
import React from 'react';
import { signup } from './actions';
import BasicModal from '../terms/View'
export function SignupView() {
  const [credentials, setCredentials] = useState({name: '', email: '', password: '', confirmPassword: ''});
  const [error, setError] = useState('');
  const [alert, setAlert] = useState(false);
  const [acceptterms, setacceptterm] = useState(false)
  
  const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email);
  const validPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(credentials.password);
  const passwordMismatch = credentials.confirmPassword && credentials.password !== credentials.confirmPassword;
  const fieldsFilled = credentials.name && credentials.email && credentials.password && credentials.confirmPassword;

  const router = useRouter();

  const t = useTranslations('signup')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {value, name} = event.target as HTMLInputElement;
    setCredentials((prev) => ({...prev, [name]: value}));
  };

  const handleClick = async () => {
    const authenticated = await signup(credentials)
    if (authenticated) {
      window.sessionStorage.setItem('name', authenticated.name)
      router.push('/')
    } else {
      setError(t('error'));
      setAlert(true);
    }
  }

  const handleClickSignin = async () => {
    router.push('/login');
  }

  const handleToLandingPage = () => {
    //window.location.href = 'http://localhost:3000';
    window.location.href = 'https://sammyparks.com';
  }

  function handleClose (event: React.SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') return;
    setAlert(false);
  }



  return (
    <SessionProvider basePath="/driver/api/auth">
    <Stack>
      <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <Image src={logo} alt="Logo" width={100} height={100} onClick={handleToLandingPage} style={{cursor: 'pointer'}}/>
        <Typography sx={{fontSize: 45, fontWeight: 'bold', cursor: 'pointer'}} onClick={handleToLandingPage}>Sammy Parks.</Typography>
        <Typography sx={{pb: 3, fontFamily: 'Open Sans', fontWeight: 'bold'}}>
          {t('header')}
        </Typography>
      </Box>
      <TextField
        label={t('name')}
        name="name"
        variant="outlined"
        onChange={handleInputChange}
        sx={{ pb: 1 }}
      />
      <TextField label={t('email')} name='email'
        variant='outlined' onChange={handleInputChange} sx={{pb: 1}}
        error={credentials.email !== '' && !validEmailPattern}
        helperText={
          credentials.email !== '' && !validEmailPattern
            ? t('invalidEmailPattern') : ''
        }
      />
      <TextField type='password' label={t('password')} name='password'
        variant='outlined' onChange={handleInputChange} sx={{pb: 1}}
        error={credentials.password !== '' && !validPasswordPattern}
        helperText={
          credentials.password !== '' && !validPasswordPattern
        ? t('invalidPasswordPattern') : ''
        }
      />
      <TextField type='password' label={t('confirmPassword')} name='confirmPassword'
        variant='outlined' onChange={handleInputChange} sx={{pb: 3}}
        error={!!passwordMismatch} helperText={passwordMismatch ? t('misMatch') : ''}
      />
      <Button
        
        variant='contained'
        onClick={handleClick}
        disabled={!fieldsFilled || passwordMismatch || !validEmailPattern || !validPasswordPattern ||!acceptterms}
        sx={{
          backgroundColor: 'black',
          color: 'white',
          bottom: 0,
          left: '25%',
          right: 0,
          width: '50%',
          '&.Mui-disabled': {
            backgroundColor: '#ccc',
            color: '#666',          
          },
        }}
      >
        {t('submit')}
      </Button>
    <Typography 
            variant="body2"
            sx={{
                marginTop: '15px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}
            >
                {t('existingUserPrompt')}{' '}
            <Typography
                onClick={handleClickSignin}
                component="span"
                sx={{
                color: '#3EBD0C',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                }}
            >
                {t('signinPrompt')}
            </Typography>
    </Typography>

      <Snackbar
        open={alert}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {error ? 
          <Alert onClose={handleClose} severity="error" sx={{width: '100%'}}>
            {error}
          </Alert> : undefined
        }
      </Snackbar>
      <BasicModal 
        acceptterms={acceptterms}
        setacceptterms={setacceptterm}
      />
    </Stack>
    </SessionProvider>
  );
}

export default SignupView;