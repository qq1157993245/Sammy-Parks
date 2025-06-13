import * as React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';

export default function ErrorAlert(
  props: {
    setAlertOccurred: (value: boolean) => void;
    message: string;
  }
) {
  let open = true

  React.useEffect(() => {
    const timer = setTimeout(() => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      open = false
      props.setAlertOccurred(false)
    }, 4000);
    return () => clearTimeout(timer)
  }, [])

  return (
    <Box sx={{ 
      width: '100%',
      position: 'fixed',
      display: 'flex',
      zIndex: 1000,
      bottom: 50,
    }}>
      <Collapse in={open}>
        <Alert
          action={
            <IconButton
              aria-label="close-alert"
              color="inherit"
              size="small"
              onClick={() => {
                open = false
                props.setAlertOccurred(false)
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ 
            mb: 2,
            width: '100%',
          }}
          severity="error"
          variant="filled"
        >
          {props.message}
        </Alert>
      </Collapse>
    </Box>
  );
}