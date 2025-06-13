import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {expect, test, vi, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react';
import Page from '../src/app/[locale]/page';
import { NextIntlClientProvider } from 'next-intl';
import en_messages from '../messages/en.json';

/*********************** */
const registeredPlate = '123NICE';
/************************ */

vi.mock('@/components/check-plate/action', () =>({
    checkPermit: vi.fn((plate: string)=>{
        if (plate === 'expired') {
            return undefined; 
        } else if (plate !== registeredPlate) {
            return Promise.resolve({success: 0});
        }
        return Promise.resolve({success: 1});
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

/*
test('Elements exist', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const inputField = await screen.findByPlaceholderText('License Plate Number');
    const checkButton = await screen.findByLabelText('check button');
    const ticketButton = await screen.findByLabelText('issue ticket button');
    const clearIcon = await screen.findByLabelText('clear icon');
    const logoutButton = await screen.findByLabelText('log out');
    
    expect(inputField).not.toBeNull();
    expect(checkButton).not.toBeNull();
    expect(ticketButton).not.toBeNull();
    expect(clearIcon).not.toBeNull();
    expect(logoutButton).not.toBeNull();
});

test('Enter an unknown license plate number', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const inputField = await screen.findByPlaceholderText('License Plate Number');
    const checkButton = await screen.findByLabelText('check button');
    
    expect(inputField).not.toBeNull();
    expect(checkButton).not.toBeNull();

    await userEvent.type(inputField, '123');
    fireEvent.click(checkButton);

    const error = await screen.findByText('No permit available');
    expect(error).not.toBeNull();
});

test('Enter a valid license plate number', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const inputField = await screen.findByPlaceholderText('License Plate Number');
    const checkButton = await screen.findByLabelText('check button');

    await userEvent.type(inputField, '123NICE');
    fireEvent.click(checkButton);

    const message = await screen.findByText('Valid permit');
    expect(message).not.toBeNull();
});

test('Cookie expired', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const inputField = await screen.findByPlaceholderText('License Plate Number');
    const checkButton = await screen.findByLabelText('check button');

    await userEvent.type(inputField, 'expired');
    fireEvent.click(checkButton);

    await vi.waitFor(() => {
        expect(mockedPush).toHaveBeenCalledWith('/enforcement/login');
    });
});

test('Clear all the text', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const inputField = await screen.findByPlaceholderText('License Plate Number');
    const clearIcon = await screen.findByLabelText('clear icon');

    expect(clearIcon).not.toBeNull();

    await userEvent.type(inputField, 'ABCD');
    fireEvent.click(clearIcon);

    expect(inputField).toHaveValue('');
});
*/