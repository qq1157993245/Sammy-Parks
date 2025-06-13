'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Checkbox from '@mui/material/Checkbox';
const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
import { useTranslations } from "next-intl";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  maxHeight: '65vh',
  overflowY: 'hidden',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};
type Props ={
  acceptterms:boolean,
  setacceptterms: React.Dispatch<React.SetStateAction<(boolean)>>
}
export default function BasicModal({acceptterms,setacceptterms}:Props) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setacceptterms(false);
  };
  const handleAgree = () => {
    setOpen(false)
    setacceptterms(true);
  }

  const t = useTranslations('terms')
  
  return (
    <div style={{margin: 'auto'}}>
      <Button onClick={handleOpen}>{t('title')}</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div style={{maxWidth:'700px', marginBottom:'20px', overflow:'auto'}}>
              <h1>{t('title')}</h1>
                  <Box sx={{ maxHeight: '50vh', overflowY: 'auto', mb: 2 }}>
                    <h2>{t('agreementHeader')}</h2>
                        <p>{t('agreement')}</p>
                    <h2>{t('servicesHeader')}</h2>
                        <p>{t('services')}</p>
                    <h2>{t('feesHeader')}</h2>
                        <p>{t('fees')}</p>
                    <h2>{t('accountsHeader')}</h2>
                        <p>{t('accounts')}</p>
                    <h2>{t('conductHeader')}</h2>
                        <p>{t('conductagreenot')}
                          {t.raw('conduct').map((item:string,index:number)=>(
                                <li key={index}>{item}</li>
                          ))}                       
                        </p>
                    <h2>{t('liabilityHeader')}</h2>
                        <p>{t('liability')}</p> 
                    <Checkbox {...label} 
                      checked={acceptterms}
                      onChange={(e)=> setacceptterms(e.target.checked)}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAgree}
                      disabled={!acceptterms}
                    >
                      {t('agreeButton')}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleClose}
                      sx={{ml: 1}}
                    >
                      {t('closeButton')}
                    </Button>
                  </Box>    
          </div>
        </Box>
      </Modal>
    </div>
  );
}