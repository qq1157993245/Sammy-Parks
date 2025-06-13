import { it, afterEach, vi, expect } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'

import ErrorAlert from '../../src/components/Alert'

afterEach(() => {
  cleanup()
})

it('Renders error alert', async () => {
  const setAlertOccurred = vi.fn()
  render(
    <ErrorAlert
      setAlertOccurred={setAlertOccurred}
      message="Test error message"
    />
  )
  
  const alert = screen.getByText('Test error message')
  expect(alert).toBeDefined()
})

it('Alert times out', async () => {
  vi.useFakeTimers()
  const setAlertOccurred = vi.fn()
  render(
    <ErrorAlert
      setAlertOccurred={setAlertOccurred}
      message="Test error message"
    />
  )

  vi.runAllTimers()
  expect(setAlertOccurred).toHaveBeenCalledWith(false)
})

it('Alert is closed', async () => {
  const setAlertOccurred = vi.fn()
  render(
    <ErrorAlert
      setAlertOccurred={setAlertOccurred}
      message="Test error message"
    />
  )

  screen.getByRole('button', { name: 'close-alert' }).click()
  expect(setAlertOccurred).toHaveBeenCalledWith(false)
})