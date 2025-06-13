import { Fragment } from 'react'
import { ScreenSizeProvider } from '@/context/context';
import Home from '@/components/Home';

export default function Page() {
  return (
    <ScreenSizeProvider>
      <Fragment>
        <Home/>
      </Fragment>
    </ScreenSizeProvider>
  );
}