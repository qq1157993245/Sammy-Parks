'use client'

import {Box, Button, Stack, TextField, Typography} from '@mui/material';
import Image from 'next/image';
import logo from '../../../../public/logo.jpg';
import {useState} from 'react';
import { useRouter } from 'next/navigation';
import { login } from './action';
import { useTranslations } from "next-intl";

function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const t = useTranslations('login')

  const router = useRouter();

  async function handleLogin() {
      const user = await login({email: email, password: password});
  
      if (user) {
        window.sessionStorage.setItem('name', user.name)
        router.push('/');
      } else {
        setError(t('invalid'));
      }
  }

  return (
    <Stack>
      <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '40vh'}}>
        <Image src={logo} alt="Logo" width={100} height={100}/>
        <Typography sx={{fontSize: 45, fontWeight: 'bold'}}>Sammy Parks.</Typography>
        <Typography sx={{pb: 3, fontFamily: 'Open Sans', fontWeight: 'bold'}}>
          {t('header')}
        </Typography>
      </Box>
      <TextField
        aria-label='email'
        value={email}
        variant="outlined"
        label={t('email')}
        onChange={(e)=>setEmail(e.target.value)}
      />
      <TextField
        aria-label='password'
        value={password}
        variant="outlined"
        label={t('password')}
        type='password'
        onChange={(e)=>setPassword(e.target.value)}
      />
      {error &&
        <Typography sx={{color: 'red'}}>
          {error}
        </Typography>}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: '20px',
        }}
      >
        <Button
          aria-label='sign in'
          variant='contained'
          onClick={handleLogin}
        >
          {t('submit')} 
        </Button>
      </Box>
    </Stack>
  );
}

export default LoginClient;
