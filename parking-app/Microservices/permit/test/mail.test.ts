import { it, expect, vi } from 'vitest';
import { htmlContent } from '../src/mail/content';
// import { sendPermitReceipt } from '../src/mail/mail';

const mockSend = vi.fn().mockResolvedValue('mock-mailgun-response');

const mockMailgun = vi.fn().mockImplementation(() => ({
  client: () => ({
    messages: {
      create: mockSend,
    },
  }),
}));

it('generates correct HTML content with formatted date', () => {
  const result = htmlContent(
    '7XYZ345',
    '2024-06-06T15:00:00Z',
    '2024-06-06T17:30:00Z',
    '50',
    'A'
  );
  expect(result).toContain('<h2>Permit Receipt</h2>');
  expect(result).toContain('<strong>Zone:</strong> A');
  expect(result).toContain('<strong>Plate:</strong> 7XYZ345');
  expect(result).toContain('Valid From:');
  expect(result).toContain('Expires:');
  expect(result).toContain('$50');

  // Test for noon (12:00 PM)
  const noonTest = htmlContent(
    '8XYZ888',
    '2024-06-06T12:00:00',
    '2024-06-06T13:00:00',
    '15',
    'B'
  );
  expect(noonTest).toContain('12:00 PM');

  // Test for midnight (12:00 AM)
  const midnightTest = htmlContent(
    '9ZZZ999',
    '2024-06-06T00:00:00',
    '2024-06-06T01:00:00',
    '10',
    'C'
  );
  expect(midnightTest).toContain('12:00 AM');
});

vi.mock('mailgun.js', async () => {
  return {
    default: mockMailgun,
  };
});

it('calls Mailgun API with proper arguments', async () => {

  vi.mock('path', async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...(actual && typeof actual === 'object' ? actual : {}),
      resolve: vi.fn(() => '/fake/path/.env'),
    };
  });

  vi.mock('dotenv', async (importOriginal) => {
    const actual = await importOriginal();
    const actualObj = actual && typeof actual === 'object' ? actual : {};
    return {
      ...actualObj,
      config: vi.fn(),
    };
  });

  const { sendPermitReceipt } = await import('../src/mail/mail');

  await sendPermitReceipt('7XYZ345', '2024-06-06T15:00:00Z', '2024-06-06T17:30:00Z', '50', 'A', 'test@example.com');

  expect(mockSend).toHaveBeenCalledWith('sammyparks.com', expect.objectContaining({
    from: expect.stringContaining('postmaster@sammyparks.com'),
    to: expect.arrayContaining([expect.stringContaining('test@example.com')]),
    subject: expect.stringContaining('Permit receipt'),
    html: expect.stringContaining('Permit Receipt'),
  }));
});

it('logs error when mail sending fails', async () => {
  const errorMock = new Error('Mailgun send failed');
  mockSend.mockRejectedValueOnce(errorMock);

  const { sendPermitReceipt } = await import('../src/mail/mail');

  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
    // intentionally empty for test
  });
  await sendPermitReceipt('7XYZ345', '2024-06-06T15:00:00Z', '2024-06-06T17:30:00Z', '50', 'A', 'fail@example.com');
  
  expect(consoleSpy).toHaveBeenCalledWith(errorMock);
  consoleSpy.mockRestore();
});