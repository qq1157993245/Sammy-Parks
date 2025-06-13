import {
  getDriverAccounts,
  getEnforcementAccounts,
  fetchTicketsForAdmin,
} from '@/components/admin/actions';
import AdministrationView from '@/components/admin/View';
import { check } from '@/auth/service';
import { cookies } from 'next/headers';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Fragment } from 'react'
import { Box } from '@mui/material';

export default async function AdministrationPage() {
  const cookie = (await cookies()).get('session')?.value;
  await check(cookie);

  const [drivers, enforcers, tickets] = await Promise.all([
    getDriverAccounts(),
    getEnforcementAccounts(),
    fetchTicketsForAdmin(),
  ]);

  return (
    <Fragment>
      <Box sx={{position: 'fixed', bottom: '0px', right: '0px', zIndex: 2000}}>
        <LocaleSwitcher/>
      </Box>
      <AdministrationView
        driverAccounts={drivers}
        enforcementAccounts={enforcers}
        tickets={tickets}
      />
    </Fragment>
  );
}
