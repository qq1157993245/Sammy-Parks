// eslint-disable @typescript-eslint/no-explicit-any
import { it, afterEach, vi, expect } from 'vitest'
import { render, cleanup, screen, waitFor, act, fireEvent } from '@testing-library/react'
import React from 'react'
import { IntlProvider } from 'next-intl';

import EnforceView from '../src/components/enforcement/EnforcementView'
import en from '../messages/en.json'
import userEvent from '@testing-library/user-event';
// import { Driver, Enforcer, Ticket } from '../src/components/admin/types'


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

vi.mock('../src/components/enforcement/action', () => ({
  checkPermit: vi.fn(() => Promise.resolve({
    success: 1,
    result: { data: { getPermitByPlate: { id: 'permit1', plate: 'ABC123' } } },
    message: 'Vehicle has a permit'
  })),
  logout: vi.fn(() => Promise.resolve()),
  listTypes: vi.fn(() => Promise.resolve([
    { id: 'type1', violation: 'Test Violation' }
  ])),
  createTicket: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

it('renders view', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <EnforceView />
    </IntlProvider>
  )
})

it('type in textfield and clear', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <EnforceView />
    </IntlProvider>
  )

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'Test Input')

  const button = screen.getByLabelText('clear icon')
  await userEvent.click(button)
})

it('type in textfield and check', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <EnforceView />
    </IntlProvider>
  )

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'Test Input')

  const button = screen.getByLabelText('check button')
  await userEvent.click(button)
})

/*
  createTicket: vi.fn(() => Promise.resolve({
    success: 1,
    message: 'A ticket is created'
  })),
*/

it('type in textfield and error in create ticket', async () => {
  const { createTicket } = await import('../src/components/enforcement/action');
  vi.mocked(createTicket).mockImplementationOnce(async () => ({
    success: 0,
    message: 'Error creating ticket'
  }));

  render(
    <IntlProvider locale="en" messages={en}>
      <EnforceView />
    </IntlProvider>
  )

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'ABC123')

  await waitFor(async () => {
    const button = screen.getByLabelText('issue ticket button')
    await userEvent.click(button)
    await userEvent.tab()
    await userEvent.keyboard('{enter}')
    const vio = screen.getByText('Test Violation')
    await userEvent.click(vio)
    const sub = screen.getByText('Create')
    await userEvent.click(sub)
  })
})

it('type in textfield and create ticket', async () => {
  const { createTicket } = await import('../src/components/enforcement/action');
  vi.mocked(createTicket).mockImplementationOnce(async () => ({
    success: 1,
    message: 'Ticket created successfully'
  }));

  render(
    <IntlProvider locale="en" messages={en}>
      <EnforceView />
    </IntlProvider>
  )

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'plate123')

  await waitFor(async () => {
    const button = screen.getByLabelText('issue ticket button')
    await userEvent.click(button)
    await userEvent.tab()
    await userEvent.keyboard('{enter}')
    const vio = screen.getByText('Test Violation')
    await userEvent.click(vio)
    const sub = screen.getByText('Create')
    await userEvent.click(sub)
  })
})