'use client';

import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

interface Props {
  zones: string[];
  zonePermits: Record<string, { current: number | null; newLimit: number }>;
  setZonePermits: React.Dispatch<
    React.SetStateAction<
      Record<string, { current: number | null; newLimit: number }>
    >
  >;
  updateZoneMaxPermits: (zone: string, limit: number) => Promise<boolean>;
  isPending: boolean;
}

export default function PermitView({
  zones,
  zonePermits,
  setZonePermits,
  updateZoneMaxPermits,
  isPending,
}: Props) {
  const t = useTranslations('administration');

  return (
    <>
      {zones.map((zone) => (
        <Box component={Paper} p={3} mb={4} key={zone} aria-label={`zone-${zone}`}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" gutterBottom>
              {`Zone ${zone} Max Permits`}
            </Typography>
            <Typography>
              Current Max: {zonePermits[zone].current ?? 'Loading...'}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <TextField
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
              size="small"
              label="New Limit"
              variant="outlined"
              value={zonePermits[zone].newLimit}
              onChange={(e) => {
                const newVal = parseInt(e.target.value as string, 10) || 1;
                setZonePermits((prev) => ({
                  ...prev,
                  [zone]: { ...prev[zone], newLimit: newVal },
                }));
              }}
              sx={{ width: 150 }}
            />
            <Button
              aria-label={`update-zone-${zone}`}
              variant="contained"
              size="medium"
              onClick={() => {
                updateZoneMaxPermits(zone, zonePermits[zone].newLimit).then(
                  (success) => {
                    if (success) {
                      setZonePermits((prev) => ({
                        ...prev,
                        [zone]: {
                          ...prev[zone],
                          current: prev[zone].newLimit,
                        },
                      }));
                    }
                  }
                );
              }}
              disabled={isPending}
            >
              {t('override')}
            </Button>
          </Box>
        </Box>
      ))}
    </>
  );
}