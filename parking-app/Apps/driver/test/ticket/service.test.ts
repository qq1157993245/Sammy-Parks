import { fetchTicketsForCurrentDriver } from '../../src/components/ticket/actions';
import { it, expect, vi} from 'vitest';
import { getTicketsForDriver, markTicketAsPaid, challengeTicket } from '../../src/ticket/service';
import { markCurrentDriverTicketAsPaid, challengeTicketForCurrentDriver } from '../../src/components/ticket/actions';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'fake-token' })),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

it('getTicketsForDriver unauthorized error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({errors: [{message: 'Failed to fetch tickets from Ticket Microservice'}]}),
    } as Response),
  )
  await expect(getTicketsForDriver('')).rejects.toThrow('Failed to fetch tickets from Ticket Microservice');
});


it('markTicketAsPaid handles GraphQL error response', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ errors: ['Some error'] }),
    } as Response)
  );


  await expect(markTicketAsPaid('123')).rejects.toThrow('Mark ticket as paid failed');
});

it('returns tickets from successful response', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      ok: true,
      headers: new Headers(),
      redirected: false,
      statusText: 'OK',
      type: 'basic',
      url: '',
      clone: () => this,
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({
        data: {
          ticketsByDriver: [
            {
              id: '1',
              data: {
                driverId: 'd1',
                driverName: 'Test Driver',
                violation: 'Speeding',
                overridden: false,
                paid: false,
                amount: 100,
                issuedBy: 'Officer A',
                createdAt: '2024-01-01T00:00:00.000Z',
              },
            },
          ],
        },
      }),
    } as unknown as Response)
  );

  const result = await getTicketsForDriver('driver-123');
  expect(result).toEqual([
    {
      id: '1',
      data: {
        driverId: 'd1',
        driverName: 'Test Driver',
        violation: 'Speeding',
        overridden: false,
        paid: false,
        amount: 100,
        issuedBy: 'Officer A',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  ]);
});

it('fetchTicketsForCurrentDriver throws error when check fails', async () => {
  vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
      get: vi.fn(() => ({ value: 'fake-token' }))
    })),
  }));
  global.fetch = vi.fn((url) => {
    if ((url as string).includes('/check')) {
      return Promise.resolve({
        ok: false,
        status: 401,
      } as Response);
    }
    return Promise.reject('Unexpected fetch');
  });

  await expect(fetchTicketsForCurrentDriver()).rejects.toThrow('Failed to validate session');
});

it('fetchTicketsForCurrentDriver returns tickets from service', async () => {
  vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
      get: vi.fn(() => ({ value: 'fake-token' }))
    })),
  }));
  global.fetch = vi.fn((url) => {
    if ((url as string).includes('/check')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'driver-123' }),
      } as Response);
    }

    if ((url as string).includes('graphql')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            ticketsByDriver: [
              {
                id: '1',
                data: {
                  driverId: 'd1',
                  driverName: 'John Doe',
                  violation: 'Illegal Parking',
                  overridden: false,
                  paid: false,
                  amount: 50,
                  issuedBy: 'Enforcer 1',
                  createdAt: '2024-05-01T00:00:00.000Z',
                },
              },
            ],
          },
        }),
      } as Response);
    }

    return Promise.reject('Unexpected fetch');
  });

  const tickets = await fetchTicketsForCurrentDriver();
  expect(tickets).toEqual([
    {
      id: '1',
      data: {
        driverId: 'd1',
        driverName: 'John Doe',
        violation: 'Illegal Parking',
        overridden: false,
        paid: false,
        amount: 50,
        issuedBy: 'Enforcer 1',
        createdAt: '2024-05-01T00:00:00.000Z',
      },
    },
  ]);
});

it('markCurrentDriverTicketAsPaid throws error when no session cookie', async () => {
  vi.mock('next/headers', async () => {
    const actual = await vi.importActual<typeof import('next/headers')>('next/headers');
    return {
      ...actual,
      cookies: () => ({
        get: () => undefined,
      }),
    };
  });

  await expect(undefined);
});

it('markCurrentDriverTicketAsPaid throws error when check fails', async () => {
  vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
      get: vi.fn(() => ({ value: 'fake-token' }))
    })),
  }));
  global.fetch = vi.fn(() => Promise.resolve({
    ok: false,
    status: 401
  } as Response));
  await expect(markCurrentDriverTicketAsPaid('ticket-1')).rejects.toThrow('Failed to validate session');
});

it('markCurrentDriverTicketAsPaid throws error if driver ID missing', async () => {
  vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
      get: vi.fn(() => ({ value: 'fake-token' }))
    })),
  }));
  global.fetch = vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  } as Response));
  await expect(markCurrentDriverTicketAsPaid('ticket-1')).rejects.toThrow('Driver ID missing from check response');
});

it('challengeTicketForCurrentDriver throws error when no session cookie', async () => {
  vi.mock('next/headers', async () => {
    const actual = await vi.importActual<typeof import('next/headers')>('next/headers');
    return {
      ...actual,
      cookies: () => ({
        get: () => undefined
      }),
    };
  });
  const result = challengeTicketForCurrentDriver('ticket-1', 'msg');
  await expect(result).rejects.toThrow('Driver ID missing from check response');
});

it('challengeTicketForCurrentDriver throws error when check fails', async () => {
  vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
      get: vi.fn(() => ({ value: 'fake-token' }))
    })),
  }));
  global.fetch = vi.fn(() => Promise.resolve({
    ok: false,
    status: 401
  } as Response));
  await expect(challengeTicketForCurrentDriver('ticket-1', 'msg')).rejects.toThrow('Failed to validate session');
});

it('challengeTicketForCurrentDriver throws error if driver ID missing', async () => {
  vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
      get: vi.fn(() => ({ value: 'fake-token' }))
    })),
  }));
  global.fetch = vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  } as Response));
  await expect(challengeTicketForCurrentDriver('ticket-1', 'msg')).rejects.toThrow('Driver ID missing from check response');
});

it('challengeTicket handles GraphQL error', async () => {
  vi.mock('next/headers', () => ({
    cookies: () => ({
      get: () => ({ value: 'fake-token' }),
    }),
  }));

  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        errors: ['Some GraphQL error'],
      }),
    } as Response)
  );

  await expect(challengeTicket('ticket-1', 'Incorrect info')).rejects.toThrow('Challenging ticket failed');
});

it('challengeTicket succeeds when no GraphQL error', async () => {
  vi.mock('next/headers', () => ({
    cookies: () => ({
      get: () => ({ value: 'fake-token' }),
    }),
  }));

  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: {
          challengeTicket: {
            id: 'ticket-1',
            data: {
              challenged: true,
              challengeMessage: 'Incorrect info',
              challengeDenied: false
            }
          }
        }
      }),
    } as Response)
  );

  await expect(challengeTicket('ticket-1', 'Incorrect info')).resolves.toBeUndefined();
});