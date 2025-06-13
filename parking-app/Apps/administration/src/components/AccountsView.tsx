'use client';

import { Typography, Button, Box, Grid, Card, CardContent, CardActions } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { Driver, Enforcer } from './admin/types';

interface Props {
  drivers: Driver[];
  enforcers: Enforcer[];
  isPending: boolean;
  toggleStatus: (
    id: string,
    currentStatus: 'active' | 'suspended',
    type: 'driver' | 'enforcer'
  ) => void;
}

export default function AccountView({
  drivers,
  enforcers,
  isPending,
  toggleStatus,
}: Props) {
  const t = useTranslations('administration');

  return (
    <>
      {/* Driver Accounts Section */}
      <Box mb={6} textAlign="center">
        <Typography variant="h6" gutterBottom>
          {t('driver-account')}
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {drivers.map((d) => (
            <Grid component="div" size={{ xs: 10, md: 3.5, lg: 3 }} key={d.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{d.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('status')}: {d.status}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button
                    aria-label={`toggle-driver-${d.id}`}
                    variant="contained"
                    size="small"
                    onClick={() => toggleStatus(d.id, d.status, 'driver')}
                    disabled={isPending}
                  >
                    {d.status === 'active' ? t('suspend') : t('activate')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Enforcement Accounts Section */}
      <Box mb={6} textAlign="center">
        <Typography variant="h6" gutterBottom>
          {t('enforcement')}
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {enforcers.map((e) => (
            <Grid component="div" size={{ xs: 12, md: 6, lg: 2.5 }} key={e.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{e.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('status')}: {e.status}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button
                    aria-label={`toggle-enforcer-${e.id}`}
                    variant="contained"
                    size="small"
                    onClick={() => toggleStatus(e.id, e.status, 'enforcer')}
                    disabled={isPending}
                  >
                    {e.status === 'active' ? t('suspend') : t('activate')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}