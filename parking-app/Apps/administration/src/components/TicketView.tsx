'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
  TextField,
  Button,
} from '@mui/material';
import type { TicketType, Vehicle, Ticket, Enforcer } from './admin/types';
import { useTranslations } from 'next-intl';

interface Props {
  ticketTypes: TicketType[];
  fees: number[];
  setFees: React.Dispatch<React.SetStateAction<number[]>>;
  handleSetPrice: (id: string, price: number) => void;
  ticketList: Ticket[];
  isPending: boolean;
  handleOverride: (id: string) => void;
  handleResolveChallenge: (id: string, accept: boolean) => void;
  vehicles: Record<string, Vehicle>;
  enforcers: Enforcer[];
}

const getEnforcerName = (id: string, enforcers: Enforcer[]) =>
  enforcers.find((e) => e.id === id)?.name || 'Unknown';

export default function TicketView({
  ticketTypes,
  fees,
  setFees,
  handleSetPrice,
  ticketList,
  isPending,
  handleOverride,
  handleResolveChallenge,
  vehicles,
  enforcers,
}: Props) {
  const t = useTranslations('administration');

  return (
    <>
      {/* Ticket Violations Section */}
      <Box mt={3} mb={6} display="flex" flexDirection="column" gap={4}>
        <Typography variant="h6" gutterBottom>
          Ticket Violations
        </Typography>
        {ticketTypes.map((tt, index) => (
          <Box
            key={tt.id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
            aria-label={`violation-${tt.id}`}
            p={2}
            border="1px solid #ccc"
            borderRadius={2}
            boxShadow={1}
          >
            <Box flexGrow={1}>
              <Typography variant="subtitle1">
                {tt.violation}: ${tt.price}
              </Typography>
            </Box>
            <TextField
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
              size="small"
              label={t('fine')}
              variant="outlined"
              value={fees[index] || ''}
              onChange={(e) => {
                const newVal = parseInt(e.target.value as string, 10) || 0;
                setFees((prev) =>
                  prev.map((fee, i) => (i === index ? newVal : fee))
                );
              }}
              sx={{ width: 150, mr: 2 }}
            />
            <Button
              aria-label={`update-violation-fee-${tt.id}`}
              variant="contained"
              size="small"
              onClick={() => handleSetPrice(tt.id, fees[index])}
              disabled={isPending}
            >
              {t('override')}
            </Button>
          </Box>
        ))}
      </Box>

      {/* Ticket List Section */}
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>
          {t('ticket')}
        </Typography>
        <List>
          {ticketList.length === 0 ? (
            <ListItem>{t('no-ticket')}</ListItem>
          ) : (
            ticketList.map((ticket) => (
              <ListItem
                key={ticket.id}
                aria-label={`ticket-${ticket.id}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #ccc',
                  pb: 2,
                  mb: 2,
                }}
              >
                <Box
                  width="100%"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography>
                      <strong>{t('driver')}:</strong> {ticket.data.driverName} — {t('plate')}: <em>{vehicles?.[ticket.data.driverId]?.plate ?? 'N/A'}</em> — {t('violation')}: <em>{ticket.data.violation}</em>
                    </Typography>
                    <Typography variant="body2">
                      {t('status')}: {ticket.data.paid ? t('paid') : t('unpaid')} |{' '}
                      {t('issuer')}: {getEnforcerName(ticket.data.issuedBy || '', enforcers)} |{' '}
                      {t('overridden')}:{' '}
                      {ticket.data.overridden ? t('yes') : t('no')} |{' '}
                      {t('date')}: {new Date(ticket.data.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Button
                    aria-label={`override-ticket-${ticket.id}`}
                    variant="contained"
                    size="small"
                    color={ticket.data.overridden ? 'primary' : 'error'}
                    onClick={() => handleOverride(ticket.id)}
                    disabled={isPending || ticket.data.overridden}
                  >
                    {ticket.data.overridden ? t('overridden') : t('override')}
                  </Button>
                </Box>

                {ticket.data.challengeMessage && (
                  <Box
                    mt={2}
                    width="100%"
                    p={2}
                    border="1px solid #aaa"
                    borderRadius={1}
                    bgcolor="#f9f9f9"
                    aria-label={`challenge-${ticket.id}`}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                      {t('challenge-message')}:
                    </Typography>
                    <Typography variant="body2" fontStyle="italic" mb={2}>
                      {ticket.data.challengeMessage}
                    </Typography>

                    {ticket.data.challenged && !ticket.data.overridden && (
                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          aria-label={`accept-challenge-${ticket.id}`}
                          variant="contained"
                          size="small"
                          color="success"
                          sx={{ mr: 1 }}
                          onClick={() => handleResolveChallenge(ticket.id, true)}
                          disabled={isPending}
                        >
                          {t('accept')}
                        </Button>
                        <Button
                          aria-label={`deny-challenge-${ticket.id}`}
                          variant="contained"
                          size="small"
                          color="warning"
                          onClick={() => handleResolveChallenge(ticket.id, false)}
                          disabled={isPending}
                        >
                          {t('deny')}
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </>
  );
}