'use client'
import { useState } from 'react';
import { TextField, Stack, Button, Typography, Box } from '@mui/material';
import Image from 'next/image';
import logo from '../../../../public/logo.jpg';
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl";
import { login } from './actions';

/**
 * @returns {*} login
 */
export function LoginView() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const router = useRouter();
  const t = useTranslations('login')

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = event.target as HTMLInputElement;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleClick = async () => {
    const authenticated = await login(credentials);
    if (authenticated) {
      window.sessionStorage.setItem('name', authenticated.name);
      router.push('/');
    } else {
      setError(t('error'))
    }
  };

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
        label={t('email')}
        name="email"
        variant="outlined"
        onChange={handleInputChange}
      />
      <TextField
        type="password"
        label={t('password')}
        name="password"
        variant="outlined"
        onChange={handleInputChange}
        sx={{ pb: 5 }}
      />
      {error && <Typography sx={{color: 'red'}}>{t('error')}</Typography>}
      <Button
        sx={{
          background: 'black',
          color: 'white',
          bottom: 0,
          left: '25%',
          right: 0,
          width: '50%',
        }}
        onClick={handleClick}
      >
        {t('submit')}
      </Button>
    </Stack>
  );
}

export default LoginView;
