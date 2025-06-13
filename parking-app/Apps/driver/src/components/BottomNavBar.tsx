import {BottomNavigation, Box, IconButton} from '@mui/material';
import {useRouter} from 'next/navigation'
import Home from '@mui/icons-material/Home';
import Logout from '@mui/icons-material/Logout';
import Person from '@mui/icons-material/Person';
import {logout} from './login/actions';
import {SessionProvider, signOut} from 'next-auth/react'

/**
 * @returns {*} bottom navigation bar
 */
export function BottomNavBar() {
  const router = useRouter()
  const logoutUser = async() => {

    await signOut({redirect: false})
    await logout()


    // const normal = document.cookie.includes('session')
    // console.log("normal",normal)
    // logout()
    router.push('/login');



    // router.push('/driver');
  };

  return (
    <SessionProvider basePath='/driver/api/auth'>
    <Box sx={{position: 'fixed', bottom: 0, left: 0, right: 0}}>
      <BottomNavigation sx={{color: '#3c143c'}}>
        <IconButton sx={{right: '30%'}} onClick={() => {router.push('/')}} aria-label='home button'>
          <Home/>
        </IconButton>
        <IconButton onClick={() => router.push('/profile')} aria-label='profile button'>
          <Person/>
        </IconButton>
        <IconButton sx={{left: '30%'}} onClick={logoutUser} aria-label='logout button'
        >
          <Logout/>
        </IconButton>
      </BottomNavigation>
    </Box>
    </SessionProvider>
  );
}

export default BottomNavBar;
