'use client'

import React, { createContext, ReactNode, useContext, useRef } from 'react';
import { useMediaQuery } from '@mui/material';

type ScreenSizeContextType = {
    isSmallScreen: boolean;
    scrollRef: React.RefObject<HTMLDivElement | null>;
};

export const ScreenSizeContext = createContext<ScreenSizeContextType | null>(null);

export const ScreenSizeProvider = ({ children }: { children: ReactNode }) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScreenSizeContext.Provider value={{ isSmallScreen, scrollRef }}>
      {children}
    </ScreenSizeContext.Provider>
  );
};

export const useTextContext = () => {
  const context = useContext(ScreenSizeContext);
  if (!context) {
    throw new Error('useScreenSize must be used within ScreenSizeProvider');
  }
  return context;
};

