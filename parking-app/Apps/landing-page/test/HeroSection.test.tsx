import {  afterEach, expect, test, vi } from 'vitest'
import {  cleanup, fireEvent, render, screen } from '@testing-library/react';
import HeroSection from '@/components/HeroSection';

afterEach(() => {
  cleanup();
});
afterEach(() => {
  vi.clearAllMocks();
})

const mockedPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockedPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: vi.fn(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

const mockedUseTextContext = vi.hoisted(()=>vi.fn())
const MockedScreenSizeProvider = vi.hoisted(()=>vi.fn());
vi.mock('@/context/context', () => ({
  useTextContext: mockedUseTextContext,
  ScreenSizeProvider: MockedScreenSizeProvider,
}));

test('Necessary components exist', async () =>{
  mockedUseTextContext.mockReturnValue({
    isSmallScreen: false,
    scrollRef: { current: { scrollTo: vi.fn() } }
  });
  MockedScreenSizeProvider.mockImplementation(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  )

  render(
    <MockedScreenSizeProvider>
      <HeroSection/>
    </MockedScreenSizeProvider>
  );

  const loginButton = await screen.findByLabelText('Log In Now')
  const registerButton = await screen.findByLabelText('Register Now')
  const purchaseButton = await screen.findByLabelText('Start Purchasing')

  expect(loginButton).toBeInTheDocument()
  expect(registerButton).toBeInTheDocument()
  expect(purchaseButton).toBeInTheDocument()
});

test('Navigation when clicking buttons', async () =>{
  mockedUseTextContext.mockReturnValue({
    isSmallScreen: false,
    scrollRef: { current: { scrollTo: vi.fn() } }
  });
  MockedScreenSizeProvider.mockImplementation(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  )

  render(
    <MockedScreenSizeProvider>
      <HeroSection/>
    </MockedScreenSizeProvider>
  );

  const loginButton = await screen.findByLabelText('Log In Now')
  const registerButton = await screen.findByLabelText('Register Now')
  const purchaseButton = await screen.findByLabelText('Start Purchasing')

  fireEvent.click(loginButton)
  expect(mockedPush).toHaveBeenCalled();
  
  fireEvent.click(registerButton)
  expect(mockedPush).toHaveBeenCalled();

  fireEvent.click(purchaseButton)
  expect(mockedPush).toHaveBeenCalled();
});

test('Components for small screen', async () =>{
  mockedUseTextContext.mockReturnValue({
    isSmallScreen: true,
    scrollRef: { current: { scrollTo: vi.fn() } }
  });
  MockedScreenSizeProvider.mockImplementation(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  )

  render(
    <MockedScreenSizeProvider>
      <HeroSection/>
    </MockedScreenSizeProvider>
  );
});