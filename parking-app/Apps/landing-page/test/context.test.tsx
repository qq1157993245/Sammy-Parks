import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { ScreenSizeProvider, useTextContext } from '@/context/context';

const mockedUseMediaQuery = vi.hoisted(()=>vi.fn());

vi.mock('@mui/material', async (importOriginal) => {
    console.log(importOriginal)
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    useMediaQuery: mockedUseMediaQuery,
  };
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const Consumer = () => {
  const { isSmallScreen, scrollRef } = useTextContext();
  
  return (
    <>
      <div data-testid="screen-size">{isSmallScreen ? 'small' : 'large'}</div>
      <div data-testid="scroll-ref">{scrollRef.current ? 'ref set' : 'ref null'}</div>
    </>
  );
};

test('Context is valid', () => {
  mockedUseMediaQuery.mockReturnValue(true); // Simulate small screen

  render(
    <ScreenSizeProvider>
      <Consumer />
    </ScreenSizeProvider>
  );
});

test('Context is not valid', () => {
  const BrokenConsumer = () => {
    return <>{useTextContext().isSmallScreen}</>;
  };

  expect(() =>
    render(<BrokenConsumer />)
  ).toThrowError('useScreenSize must be used within ScreenSizeProvider');
});
