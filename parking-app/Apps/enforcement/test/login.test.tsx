import { fireEvent, render, screen } from '@testing-library/react';
import en from '../messages/en.json'
import userEvent from '@testing-library/user-event';
import {expect, test, vi, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react';
import Page from '@/app/[locale]/login/page';
import { IntlProvider, NextIntlClientProvider } from 'next-intl';
import en_messages from '../messages/en.json';

/*************************** */
const validEmail = 'email@gmail.com'
const validPassword = 'password@gmail.com'
/*************************** */

vi.mock('@/components/login/action', () =>({
    login: vi.fn((credentials: {email: string, password: string})=>{
        if (credentials.email === validEmail && credentials.password === validPassword) {
            return {name: 'ethan', accessToken: 'valid-token-123'}
        } else {
            return undefined
        }
    })
}))

const mockedPush = vi.hoisted(()=>vi.fn())
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

afterEach(() => {
    cleanup();
});
afterAll(()=>{
    vi.resetAllMocks()
})

test('Elements exist', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');
    const loginButton = await screen.findByLabelText('sign in');

    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument()
});

test('Enter invalid credentials', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');
    const loginButton = await screen.findByLabelText('sign in');

    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument()

    await userEvent.type(email, 'email@gmail.com');
    await userEvent.type(password, '123');
    fireEvent.click(loginButton);
    
    const error = await screen.findByText('Invalid Credentials');
    expect(error).toBeInTheDocument()
});

test('Enter Nothing', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const loginButton = await screen.findByLabelText('sign in');
    fireEvent.click(loginButton);
    
    const error = await screen.findByText('Invalid Credentials');
    expect(error).toBeInTheDocument()
});

test('Enter valid credentials', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');
    const loginButton = await screen.findByLabelText('sign in');

    await userEvent.type(email, 'email@gmail.com');
    await userEvent.type(password, 'password@gmail.com');
    fireEvent.click(loginButton);
    
    await vi.waitFor(() => {
        expect(mockedPush).toHaveBeenCalledWith('/');
    });
});

test('Locale Switcher', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  const select = screen.getByText('English').closest("select");
  fireEvent.change(select, { target: { value: 'es' } });
});
