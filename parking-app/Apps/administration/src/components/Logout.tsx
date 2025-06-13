'use client';

import { logout } from '../components/login/actions';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';

export default function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <Button variant="outlined" color="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
}
