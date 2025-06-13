import {  afterAll, afterEach, expect, test, vi } from 'vitest'
import {  cleanup, fireEvent, render, screen } from '@testing-library/react';
import TopBar from '@/components/Topbar';

afterEach(() => {
  cleanup();
});
afterEach(() => {
  vi.resetAllMocks()
})
afterAll(() => {
  vi.resetAllMocks()
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

test('Necessary components exist for large screen', async () =>{
  mockedUseTextContext.mockReturnValue({
    isSmallScreen: false,
    scrollRef: { current: { scrollTo: vi.fn() } }
  });
  MockedScreenSizeProvider.mockImplementation(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  )

  render(
    <MockedScreenSizeProvider>
      <TopBar/>
    </MockedScreenSizeProvider>
  );

  const title = await screen.findByLabelText('title');
  const loginButton = await screen.findByLabelText('Log In');
  const signupButton = await screen.findByLabelText('Sign Up');
  const registerButton = await screen.findByLabelText('Register Vehicles');
  const purchaseButton = await screen.findByLabelText('Purchase Permits');

  expect(title).toBeInTheDocument();
  expect(loginButton).toBeInTheDocument();
  expect(signupButton).toBeInTheDocument();
  expect(registerButton).toBeInTheDocument();
  expect(purchaseButton).toBeInTheDocument();
});

test('Scroll back to the top', async () =>{
  mockedUseTextContext.mockReturnValue({
    isSmallScreen: false,
    scrollRef: { current: { scrollTo: vi.fn() } }
  });
  MockedScreenSizeProvider.mockImplementation(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  )

  render(
    <MockedScreenSizeProvider>
      <TopBar/>
    </MockedScreenSizeProvider>
  );

  const title = screen.getByLabelText('title');
  fireEvent.click(title)
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
      <TopBar/>
    </MockedScreenSizeProvider>
  );

  const loginButton = await screen.findByLabelText('Log In');
  const signupButton = await screen.findByLabelText('Sign Up');
  const registerButton = await screen.findByLabelText('Register Vehicles');
  const purchaseButton = await screen.findByLabelText('Purchase Permits');

  fireEvent.click(loginButton)
  expect(mockedPush).toHaveBeenCalled()

  fireEvent.click(signupButton)
  expect(mockedPush).toHaveBeenCalled()

  fireEvent.click(registerButton)
  expect(mockedPush).toHaveBeenCalled()

  fireEvent.click(purchaseButton)
  expect(mockedPush).toHaveBeenCalled()
});

test('Components exist for small screen', async () =>{
  mockedUseTextContext.mockReturnValue({
    isSmallScreen: true,
    scrollRef: { current: { scrollTo: vi.fn() } }
  });
  MockedScreenSizeProvider.mockImplementation(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  )

  render(
    <MockedScreenSizeProvider>
      <TopBar/>
    </MockedScreenSizeProvider>
  );

  const menuButton = await screen.findByLabelText('menu')
  expect(menuButton).toBeInTheDocument()

  fireEvent.click(menuButton)
  const list = await screen.findByLabelText('list')
  expect(list).toBeInTheDocument()
});