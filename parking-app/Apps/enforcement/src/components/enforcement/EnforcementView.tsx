'use client'

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, MenuItem, Snackbar, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import LogoutIcon from '@mui/icons-material/Logout';
import { checkPermit, logout, listTypes, createTicket } from './action'
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl"
import { TicketType } from '@/ticket'

export default function EnforcementView() {
  const [message, setMessage] = useState('');
  const [succeed, setSucceed] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [violation, setViolation] = useState('');
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])

  const t = useTranslations('enforcement')

  const router = useRouter();
    
  useEffect(() => {
    const fetchData = async () => {
      setTicketTypes(await listTypes())
    }
    fetchData()
  }, []);
    
  async function handleCreateTicket () {
      if (!input || !violation) {
        setError(t('error'));
        setAlert(true);
      } else {
          const result = await createTicket(input, violation);
          if (!result) {
            router.push('/enforcement/login');
          } else {
              if (!result.success) {
                setError(result.message);
              } else {
                setSucceed(true);
                setError('');

                setViolation('');
              }
              setAlert(true);
          }
      }
  }
    
  function handleClose (event: React.SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') return;
    setAlert(false);
  }

  async function handleCheck () {
    const result = await checkPermit(input);
    if (!result) {
      router.push('/enforcement/login');
    } else {
      if (result.success) {
        setMessage(t('valid') + result.result.data.getPermitByPlate.zone);
      } else {
        setMessage(t('no-permit'));
      }
    }
  }

  async function handleIssueTicket () {
    if (input) setOpen(!open)
  }

  async function handleLogout () {
    await logout();
    router.push('/login');
  }

  return (
    <Box 
        sx={{
           display: 'flex',
           flexDirection: 'column' 
        }}
    >
      <TextField 
        placeholder={t('license-plate')} 
        variant="outlined" 
        value={input}
        onChange={(e)=> {
          setInput(e.target.value)
          setMessage('');
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  aria-label='clear icon'
                  onClick={()=> {
                    setInput('')
                    setMessage('')
                  }}
                >
                  <ClearIcon/>
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {message && 
      <Typography variant='h6'>
        {message}
      </Typography>
      }

      <Button 
        sx={{margin: 'auto'}} 
        variant='contained'
        aria-label='check button'
        onClick={handleCheck}
      >
        {t('check')}
      </Button>

      <Button
          sx={{
            margin: 'auto',
            marginTop: '20px',
            backgroundColor: 'red',
          }} 
          variant='contained'
          aria-label='issue ticket button'
          onClick={handleIssueTicket}
      >
          {t('issue-ticket')} 
      </Button>

      <Dialog fullWidth open={open} onClose={handleIssueTicket}>
        <DialogTitle>Issuing Ticket to: {input}</DialogTitle>
        <DialogContent>
          <TextField
            select
            required
            margin="dense"
            label={t('violation-label')}
            variant="outlined"
            fullWidth
            onChange={(e) => setViolation(e.target.value)}
          >
            {ticketTypes.map((type, index) => (
              <MenuItem key={index} value={type.id}>
                {type.violation}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions style={{justifyContent: "space-between"}}>
          <Button 
            variant='contained'
            aria-label='create button'
            onClick={handleCreateTicket}
          >
            {t('create')}
          </Button>
          <Button onClick={handleIssueTicket}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {error ? (
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            Error!
          </Alert>
        ) : succeed ? (
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            Successfully created a ticket!
          </Alert>
        ) : undefined}
      </Snackbar>

      <IconButton 
        sx={{position: 'absolute', bottom: 0, right: 0}}
        onClick={handleLogout}
        aria-label='log out'
      >
        <LogoutIcon sx={{fontSize: 50}}/>
      </IconButton>
    </Box>
  )
}
