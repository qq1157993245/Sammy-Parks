// eslint-disable @typescript-eslint/no-explicit-any
import { it, afterEach, vi, expect, beforeEach } from 'vitest'

import { logout, checkPermit, createTicket, listTypes } from '../src/components/enforcement/action'
import { extractCookie } from '@/auth/service';


afterEach(() => {
  vi.clearAllMocks()
})


var listTypesMock: any;
var createTicketMock: any;
vi.mock('../src/ticket/service', () => {
  listTypesMock = vi.fn();
  createTicketMock = vi.fn();
  return {
    TicketService: class {
      listTypes = listTypesMock
      createTicket = createTicketMock
    }
  };
});

var checkPlateMock: any;
vi.mock('../src/check-plate/service', () => {
  checkPlateMock = vi.fn();
  return {
    PlateService: class {
      checkPlate = checkPlateMock
    }
  };
});

vi.mock('../src/auth/service', () => ({
  extractCookie: vi.fn(),
}));

const cookiesMock = {
  set: vi.fn(),
  delete: vi.fn(),
  get: vi.fn(() => ({ value: 'fakesession' })),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => cookiesMock),
}));


it('logout deletes session', async () => {
  await logout();
  expect(cookiesMock.delete).toHaveBeenCalledWith('session');
});

it('checkPermit has no cookie', async () => {
  (extractCookie as any).mockResolvedValue(null);

  const res = await checkPermit("ABC123");
  expect(res).toEqual({ success: 0, message: 'Unauthorized' });
});

it('checkPermit has error with checking plate', async () => {
  (extractCookie as any).mockResolvedValue("nice");
  checkPlateMock.mockResolvedValue({ errors: [{ message: 'No permit found' }] });

  const res = await checkPermit("ABC123");
  expect(res).toEqual({ success: 0, message: 'No permit found' });
});

it('checkPermit has success', async () => {
  const fet = { data: { permit: true } };
  (extractCookie as any).mockResolvedValue("nice");
  checkPlateMock.mockResolvedValue(fet);
  
  const res = await checkPermit("ABC123");
  expect(res).toEqual({ success: 1, result: fet, message: 'Vehicle has a permit' });
});

it('createTicket has no cookie', async () => {
  (extractCookie as any).mockResolvedValue(null);

  const res = await createTicket("ABC123", "Test Violation");
  expect(res).toEqual({ success: 0, message: 'Unauthorized' });
});

it('createTicket has error with checking plate', async () => {
  (extractCookie as any).mockResolvedValue("nice");
  createTicketMock.mockResolvedValue({ errors: [{ message: 'No permit found' }] });

  const res = await createTicket("ABC123", "Test Violation");
  expect(res).toEqual({success: 0, message: 'Internal Server Error'});
});

it('checkPermit has success', async () => {
  const fet = { data: { permit: true } };
  (extractCookie as any).mockResolvedValue("nice");
  createTicketMock.mockResolvedValue({ errors: [{ message: 'No permit found' }] });

  const res = await createTicket("ABC123", "Test Violation");
  expect(res).toEqual({ success: 0, message: 'Internal Server Error' });
});

it('checkPermit has success', async () => {
  const fet = { data: { permit: true } };
  (extractCookie as any).mockResolvedValue("nice");
  createTicketMock.mockResolvedValue(fet);

  const res = await createTicket("ABC123", "Test Violation");
  expect(res).toEqual({success: 1, message: 'A ticket is created'});
});

it('listTypes has success', async () => {
  (extractCookie as any).mockResolvedValue("nice");
  listTypesMock.mockResolvedValue([]);

  const res = await listTypes();
  expect(res).toEqual([]);
});

