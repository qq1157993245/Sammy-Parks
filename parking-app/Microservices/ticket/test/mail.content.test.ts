import { it, expect } from 'vitest'
// import * as http from 'http'

// import { app } from '../src/app'
import { htmlContent } from '../src/mail/content'


it('should return the correct HTML content', () => {
  const time = '2025-10-01T12:30:00Z'
  const fine = '50.00'
  const reason = 'Parking in a no-parking zone'

  expect(htmlContent(time, fine, reason).trim())
})

it('2nd time', () => {
  const time = '2025-10-03T05:30:00Z'
  const fine = '50.00'
  const reason = 'Parking in a no-parking zone'

  expect(htmlContent(time, fine, reason).trim())
})

it('3rd time', () => {
  const time = '2025-10-03T19:00:00Z'
  const fine = '50.00'
  const reason = 'Parking in a no-parking zone'

  expect(htmlContent(time, fine, reason).trim())
})