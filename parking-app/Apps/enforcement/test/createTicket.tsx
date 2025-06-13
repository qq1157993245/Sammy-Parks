import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {expect, test, vi, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react';
import Page from '../src/app/[locale]/page';
import { NextIntlClientProvider } from 'next-intl';
import en_messages from '../messages/en.json';



vi.mock("server-only", () => {return {}})

vi.mock('@/components/ticket/action', () =>({
    createTicket: vi.fn((plate: string, violation: string, amount: string)=>{
        console.log(plate);
        console.log(violation);
        console.log(amount);
        if (plate === 'Internal Server Error') {
            return {success: 0, message: 'Internal Server Error'}
        } else if (plate === 'Cookie Expired') {
            return undefined
        } else {
            return {success: 1, message: 'Successfully create a ticket'}
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
});

/*
test('Elements exist', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const plateInput = await screen.findByLabelText('License Plate Number');
    const violationInput = await screen.findByLabelText('Enter or Select a violation');
    const amountInput = await screen.findByLabelText('Enter or Select an amount');
    const createButton = await screen.findByLabelText('create button');
    const returnIcon = await screen.findByLabelText('return icon');
    const clearIcon = await screen.findByLabelText('clear icon');

    expect(plateInput).not.toBeNull();
    expect(violationInput).not.toBeNull();
    expect(amountInput).not.toBeNull();
    expect(createButton).not.toBeNull();
    expect(returnIcon).not.toBeNull();
    expect(clearIcon).not.toBeNull();
});

test('Enter nothing', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );
    
    const createButton = await screen.findByLabelText('create button');

    fireEvent.click(createButton);

    const error = await screen.findByText('All fields must be filled');
    expect(error).not.toBeNull();
});

test('Without entering a license plate number', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );
    
    const violationInput = await screen.findByLabelText('Enter or Select a violation');
    const amountInput = await screen.findByLabelText('Enter or Select an amount');
    const createButton = await screen.findByLabelText('create button');

    await userEvent.type(violationInput, 'Permit Expired');
    await userEvent.type(amountInput, '60');
    fireEvent.click(createButton);

    const error = await screen.findByText('All fields must be filled');
    expect(error).not.toBeNull();
});

test('Without entering a violation', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const plateInput = await screen.findByLabelText('License Plate Number');
    const amountInput = await screen.findByLabelText('Enter or Select an amount');
    const createButton = await screen.findByLabelText('create button');

    await userEvent.type(plateInput, '123NICE');
    await userEvent.type(amountInput, '60');
    fireEvent.click(createButton);

    const error = await screen.findByText('All fields must be filled');
    expect(error).not.toBeNull();
});

test('Without entering an amount', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const plateInput = await screen.findByLabelText('License Plate Number');
    const violationInput = await screen.findByLabelText('Enter or Select a violation');
    const createButton = await screen.findByLabelText('create button');

    await userEvent.type(plateInput, '123NICE');
    await userEvent.type(violationInput, 'Permit Expired');
    fireEvent.click(createButton);

    const error = await screen.findByText('All fields must be filled');
    expect(error).not.toBeNull();
});

test('Enter a NaN amount', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const plateInput = await screen.findByLabelText('License Plate Number');
    const violationInput = await screen.findByLabelText('Enter or Select a violation');
    const amountInput = await screen.findByLabelText('Enter or Select an amount');
    const createButton = await screen.findByLabelText('create button');

    await userEvent.type(plateInput, '123NICE');
    await userEvent.type(violationInput, 'Permit Expired');
    await userEvent.type(amountInput, 'Play');
    fireEvent.click(createButton);

    const error = await screen.findByText('Amount must be a number');
    expect(error).not.toBeNull();
});

test('Internal Server Error', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const plateInput = await screen.findByLabelText('License Plate Number');
    const violationInput = await screen.findByLabelText('Enter or Select a violation');
    const amountInput = await screen.findByLabelText('Enter or Select an amount');
    const createButton = await screen.findByLabelText('create button');

    await userEvent.type(plateInput, 'Internal Server Error');
    await userEvent.type(violationInput, 'Not Allowed Zone');
    await userEvent.type(amountInput, '200');
    fireEvent.click(createButton);

    const message = await screen.findByText('Internal Server Error');
    expect(message).not.toBeNull();
});

test('Cookie Expired', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const plateInput = await screen.findByLabelText('License Plate Number');
    const violationInput = await screen.findByLabelText('Enter or Select a violation');
    const amountInput = await screen.findByLabelText('Enter or Select an amount');
    const createButton = await screen.findByLabelText('create button');

    await userEvent.type(plateInput, 'Cookie Expired');
    await userEvent.type(violationInput, 'Not Allowed Zone');
    await userEvent.type(amountInput, '200');
    fireEvent.click(createButton);

    await vi.waitFor(() => {
        expect(mockedPush).toHaveBeenCalledWith('/enforcement/login');
    });
});

test('Successfully create a ticket', async () =>{
    render(
        <NextIntlClientProvider locale="en" messages={en_messages}>
            <Page/>
        </NextIntlClientProvider>
    );

    const plateInput = await screen.findByLabelText('License Plate Number');
    const violationInput = await screen.findByLabelText('Enter or Select a violation');
    const amountInput = await screen.findByLabelText('Enter or Select an amount');
    const createButton = await screen.findByLabelText('create button');

    await userEvent.type(plateInput, '123NICE');
    await userEvent.type(violationInput, 'Not Allowed Zone');
    await userEvent.type(amountInput, '200');
    fireEvent.click(createButton);

    const message = await screen.findByText('Successfully created a ticket!');
    expect(message).not.toBeNull();
});
*/