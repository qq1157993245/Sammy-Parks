import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Image from 'next/image';

import logo from '../../../public/sammypark.png';

interface LoadingProps {
  driveAway?: boolean
  onDriveEnd?: () => void
}

export default function Loading(props: LoadingProps) {
  const { driveAway, onDriveEnd } = props

  useEffect(() => {
    if (driveAway && onDriveEnd) {
      const timeout = setTimeout(onDriveEnd, 400)
      return () => clearTimeout(timeout)
    }
  }, [driveAway, onDriveEnd])

  return (
    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200
    }}>
      <Image
        src={logo}
        alt="Loading"
        width={64}
        height={64}
        style={{
          animation: driveAway
            ? 'driveRight 0.7s cubic-bezier(0.4,0,1,1) forwards'
            : 'rumble 0.2s infinite'
        }}
      />
      <style jsx global>{`
        @keyframes rumble {
          0%   { transform: translate(0px, 0px) rotate(-2deg); }
          20%  { transform: translate(-2px, 1px) rotate(2deg); }
          40%  { transform: translate(2px, -1px) rotate(-2deg); }
          60%  { transform: translate(-1px, 2px) rotate(1deg); }
          80%  { transform: translate(1px, -2px) rotate(-1deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes driveRight {
          0% { transform: translate(0, 0); }
          100% { transform: translateX(800px); opacity: 0; }
        }
      `}</style>
    </Box>
  );
}
