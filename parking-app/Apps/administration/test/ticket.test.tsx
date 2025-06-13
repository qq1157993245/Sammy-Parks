import { it, vi, expect } from 'vitest';
import { getAllTickets, overrideTicket, listTypes, resolveChallenge, setPrice } from '../src/services/tickets';


vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    return {
      get: vi.fn(() => ({ value: 'mock-session-token' }))
    };
  })
}));


it('getAllTickets unauthorized error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 401,
      json: () => Promise.resolve({ errors: ['Unauthorized'] })
    } as Response)
  );
  await expect(getAllTickets()).rejects.toThrow('Failed to fetch tickets from Ticket Microservice');
});

it('overrideTicket unauthorized error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 401,
      json: () => Promise.resolve({ errors: ['Unauthorized'] })
    } as Response)
  );
  await expect(overrideTicket('abc')).rejects.toThrow('Override ticket failed');
});

it('getAllTickets success', async () => {
  const mockData = [{ id: '1', data: { driverId: 'd1', driverName: 'Driver One', violation: 'Speeding', overridden: false, paid: false, amount: 100, issuedBy: 'Officer A', createdAt: new Date().toISOString() } }];
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ data: { tickets: mockData } })
    } as Response)
  );
  const tickets = await getAllTickets();
  expect(tickets).toEqual(mockData);
});

it('overrideTicket success', async () => {
  const mockResponse = { id: '1', data: { overridden: true } };
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ data: { overrideTicket: mockResponse } })
    } as Response)
  );
  const result = await overrideTicket('1');
  expect(result).toEqual(mockResponse);
});


it('setPrice success', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            setViolationPrice: {
              id: 'type1',
              price: 75,
              violation: 'Expired Permit',
            },
          },
        }),
    } as Response)
  );

  const result = await setPrice('type1', 75);
  expect(result).toEqual({
    id: 'type1',
    price: 75,
    violation: 'Expired Permit',
  });
});

it('setPrice graphql error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          errors: ['GraphQL failure'],
        }),
    } as Response)
  );

  await expect(setPrice('type1', 75)).rejects.toEqual(['GraphQL failure']);
});

it('setPrice fetch/network error', async () => {
  global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
  await expect(setPrice('type1', 75)).rejects.toThrow('Network error');
});

it('listTypes fetch/network error', async () => {
  global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
  await expect(listTypes()).rejects.toThrow('Network error');
});

it('listTypes success', async () => {
  const mockData = [{ id: 'type1', violation: 'Expired Permit' }];
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { ticketTypes: mockData } })
    } as Response)
  );
  const types = await listTypes();
  expect(types).toEqual(mockData);
});

it('listTypes failure', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ errors: ['error'] })
    } as Response)
  );

  await expect(listTypes()).rejects.toThrow();
});

it('resolveChallenge success', async () => {
  const mockResolved = { id: '123', data: { challenged: false, overridden: true } };
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { resolveChallenge: mockResolved } })
    } as Response)
  );
  const result = await resolveChallenge('123', true);
  expect(result).toEqual(mockResolved);
});


it('resolveChallenge failure', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ errors: ['unauthorized'] })
    } as Response)
  );
  await expect(resolveChallenge('123', false)).rejects.toThrow('Failed to resolve ticket challenge');
});


it('resolveChallenge falls back when cookie is undefined', async () => {
  const { cookies } = await import('next/headers');

  // Override the mock return value directly
  (cookies as any).mockReturnValue({
    get: vi.fn(() => undefined),
  });

  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            resolveChallenge: {
              id: 'abc',
              data: {
                challenged: false,
                overridden: true,
              },
            },
          },
        }),
    } as Response)
  );

  const result = await resolveChallenge('abc', true);
  expect(result).toEqual({
    id: 'abc',
    data: {
      challenged: false,
      overridden: true,
    },
  });

  const [, options] = (global.fetch as any).mock.calls[0];
  expect(options.headers.Authorization).toBeUndefined();
});