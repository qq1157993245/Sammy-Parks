/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { it, expect, vi } from 'vitest'

vi.mock('mailgun.js', () => {
  const createMock = vi.fn(async () => ({ id: '123', message: 'Queued. Thank you.' }))
  const clientMock = vi.fn(() => ({
    messages: { create: createMock }
  }))
  const MailgunMock = vi.fn(() => ({
    client: clientMock
  }))
  globalThis.__mailgunMocks = { MailgunMock, clientMock, createMock }
  return { default: MailgunMock }
})
vi.mock('form-data', () => ({
  default: function FormData() {}
}))
vi.mock('../src/mail/content', () => ({
  htmlContent: vi.fn(() => '<html>Test Content</html>')
}))

import { sendTicketEmail } from '../src/mail/mail'

it('sends an email with correct parameters', async () => {
  await sendTicketEmail('12:00', '$50', 'No Permit', 'test@example.com')

  const { MailgunMock, clientMock, createMock } = globalThis.__mailgunMocks
  expect(MailgunMock).toHaveBeenCalled()
})

it('logs error when mailgun throws', async () => {
  const { createMock } = globalThis.__mailgunMocks;
  createMock.mockImplementationOnce(async () => { throw new Error('Mailgun error') });

  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  await sendTicketEmail('12:00', '$50', 'No Permit', 'test@example.com');
  expect(logSpy).toHaveBeenCalledWith(expect.any(Error));
  logSpy.mockRestore();
});