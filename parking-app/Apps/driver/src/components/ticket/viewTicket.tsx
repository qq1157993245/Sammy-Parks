import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Button,
  Box,
  Dialog, 
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { markCurrentDriverTicketAsPaid } from './actions'; // adjust the import path if needed
import { useTranslations } from 'next-intl';
import { Ticket } from '../../ticket/index'

export default function ViewTickets({
  tickets,
  onPay,
  onChallenge,
}: {
  tickets: Ticket[];
  onPay: (ticket: Ticket) => void;
  onChallenge: (ticket: Ticket, message: string) => void;
}) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paidTicketId = searchParams.get('paidTicket');
  const t = useTranslations("ticket");

  const [open, setOpen] = useState(false);
  const [challengeMessage, setChallengeMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    async function handlePayment() {
      if (paidTicketId && sessionId) {
          await markCurrentDriverTicketAsPaid(paidTicketId);
          // window.location.href = 'http://localhost:3050/driver/tickets'; // optional redirect to clean the URL
      }
    }

    handlePayment();
  }, [paidTicketId, sessionId]);

  const handleOpenDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setChallengeMessage('');
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedTicket(null);
  };

  const handleSubmitChallenge = () => {
    if (selectedTicket && challengeMessage) {
      onChallenge(selectedTicket, challengeMessage);
      selectedTicket.data.challenged = true;
      selectedTicket.data.challengeDenied = false;
      selectedTicket.data.challengeAccepted = false;
      handleCloseDialog();
    }
  };

  if (!tickets.length) {
    return <Typography>{t("notickets")}</Typography>;
  }

  return (
    <>
      <List>
        {tickets.map((ticket, index) => (
          <React.Fragment key={ticket.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {ticket.data.violation} — ${ticket.data.price}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    <Typography variant="body2" component="span">
                      {t("date") + ": " + new Date(ticket.data.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" component="span">
                      {t("status") + ": " + (ticket.data.paid ? t("paid") : t("unpaid"))}
                    </Typography>
                    {!ticket.data.paid && (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => onPay(ticket)}
                          fullWidth
                        >
                          {t("pay")}
                        </Button>
                      </Box>
                    )}

                    {!ticket.data.paid && (
                      <Box sx={{ mt: 1 }}>
                        {ticket.data?.challengeAccepted ? (
                          <Button variant="outlined" disabled fullWidth>
                            {t('accepted')}
                          </Button>
                        ) : (
                          ticket.data?.challengeDenied ? (
                            <Button variant="outlined" disabled fullWidth>
                              {t('denied')}
                            </Button>
                          ) : (
                            !ticket.data?.challenged ? (
                              <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleOpenDialog(ticket)}
                                fullWidth
                              >
                                {t('challenge')}
                              </Button>
                            ) : (
                              <Button variant="outlined" disabled fullWidth>
                                Challenge Pending
                              </Button>
                            )
                          )
                        )}
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < tickets.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{t("challenge")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("reason")}
            type="text"
            fullWidth
            variant="outlined"
            value={challengeMessage}
            onChange={(e) => setChallengeMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmitChallenge} color="primary">
            {t("submit")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
