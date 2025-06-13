import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Checkbox from '@mui/material/Checkbox';
const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
import { useTranslations } from "next-intl";
import {checkterms,accepterms, declineterms} from './actions'
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'

import { logout } from '../login/actions';
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
export default function Terms(){
    const [acceptterms,setacceptterms] = React.useState(false)

    const router = useRouter()


    const [open, setOpen] = React.useState(false);
    // const handleOpen = () => setOpen(true);
    /* const handleClose = () => {
      setOpen(false);
    }; */
    const handleAgree = async () => {
      await accepterms()
      setOpen(false)

    }

    const t = useTranslations('terms')
    const logoutUser = async() => {
        await declineterms()

        await signOut({redirect: false})
        await logout()
    
    
        // const normal = document.cookie.includes('session')
        // console.log("normal",normal)
        // logout()
        router.push('/login');
    
    
    
        // router.push('/driver');
      };
      React.useEffect(() => {
        checkterms().then((accepted) => {
          if (!accepted) setOpen(true);
          else{
            setOpen(false)
          }
        });
      }, []);
    



    return(
        <Modal
        open={open}>
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
                  onClick={logoutUser}>
                    Disagree
                  </Button>
                </Box>    
        </div>
      </Box>
      </Modal>
    )
}