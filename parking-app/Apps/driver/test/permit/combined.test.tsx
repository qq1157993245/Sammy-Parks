import * as permitActions from '../../src/components/permit/actions';
import { it, afterEach, vi, expect, beforeAll } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock';
import { IntlProvider } from 'next-intl';
import en from '../../messages/en.json'

import Page from '../../src/app/[locale]/page'

afterEach(() => {
  cleanup()
})

beforeAll(() => {
  globalThis.fetch = vi.fn((input, init) => {
    if (typeof input === 'string' && input.includes('/api/auth/session')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => '',
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
    });
  }) as any;
});

vi.mock("server-only", () => {return {}})

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    useSearchParams: () => ({
      get: (key: string) => {
        if (key === 'session_id') return 'session_id';
        if (key === 'type') return 'type';
        if (key === 'vehicle') return 'vehicle';
        if (key === 'zoneId') return 'zoneId';
        return undefined;
      }
    }),
    redirect: vi.fn()
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    return {
      set: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(() => {
        return {
          value: 'fakesession'
        }
      })
    }
  })
}))

vi.mock('../../src/vehicle/service', () => {
  return {
    list: vi.fn(async () => {
      return [
        { plate: 'ABC123', id: '1' },
        { plate: 'XYZ789', id: '2' }
      ]
    }),
    add: vi.fn(async () => {
      return {plate: 'ZZZ000'}
    })
  };
});

vi.mock('../../src/permit/service', async () => {
  return {
    PermitService: vi.fn().mockImplementation(() => ({
    listTypes: vi.fn(async () => {
      return [{type: 'Day', id: '1'}, {type: 'One Quarter', id: '2'}]
    }),
    list: vi.fn(async () => {
      return [
        {
          plate: 'ABC123',
          startTime: new Date().toString(),
          endTime: new Date().toString(),
          vehicleId: '1',
          zone: 'Zone 1',
        }
      ]
    }),
    add: vi.fn(),
    listZones: vi.fn(async () => {
      return [
        { id: '1', name: 'Zone 1' },
        { id: '2', name: 'Zone 2' }
      ]
    }),
    getPermitCountInZone: vi.fn(async () => {
      return 3;
    }),
  }))
  }
})

vi.mock('../../src/components/stripe/actions', async () => {
  return {
    createCheckout: vi.fn(async () => {
      return ' '
    }),
  }
})

vi.mock('../../src/terms/service', async (importOriginal) => {
  const actual = (await importOriginal()) || {};
  return {
    ...actual,
    TermService: vi.fn().mockImplementation(() => ({
      checkterms: vi.fn().mockResolvedValue(true),
      acceptterms: vi.fn().mockResolvedValue('accepted'),
      declineterms: vi.fn().mockResolvedValue(true),
    })),
  };
});

it('Renders', async () => {
  const { list } = await import('../../src/vehicle/service');
  vi.mocked(list).mockResolvedValue([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Permits'))
})

it('Renders as production', async () => {
  const { list } = await import('../../src/vehicle/service');
  vi.mocked(list).mockResolvedValue([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ])
  vi.stubEnv('NODE_ENV', 'production');
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Permits'))
})


it('Click buy permit and close', async () => {
  const { list } = await import('../../src/vehicle/service');
  vi.mocked(list).mockResolvedValue([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  await waitFor(async () => {
    fireEvent.click(screen.getAllByText('Buy Permit')[0])
    fireEvent.click(screen.getByText('Cancel'))
  })
})

it('Click buy permit and buy for an invalid vehicle', async () => {
  const { list } = await import('../../src/vehicle/service');
  vi.mocked(list).mockResolvedValue([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(await screen.findByText('Buy Permit'))
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard('{ArrowDown}')
  await userEvent.keyboard('{Enter}')
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard('{Enter}')
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard('{Enter}')
  await userEvent.tab()
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')
  expect(await !screen.findByText('One Quarter'))
})

it('Click buy permit and buy', async () => {
  const { list } = await import('../../src/vehicle/service');
  vi.mocked(list).mockResolvedValue([
    { plate: 'XYZ789', id: '2', state: 'CA' }
  ])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  fireEvent.click(await screen.findByText('Buy Permit'))
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard('{Enter}')
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard('{Enter}')
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard('{ArrowDown}')
  await userEvent.keyboard('{Enter}')
  await userEvent.tab()
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')
  waitFor(async () => { expect(await screen.findByText('XYZ789')) })
})


it('calls listTypes and returns permit types', async () => {
  const result = await permitActions.listTypes();
  expect(result).toEqual([{ type: 'Day', id: '1' }, {type: 'One Quarter', id: '2'}]);
});

it('calls list and returns permits', async () => {
  const result = await permitActions.list();
  expect(result).toEqual([
    {
      plate: 'ABC123',
      startTime: expect.any(String),
      endTime: expect.any(String),
      vehicleId: '1',
      zone: 'Zone 1',
    }
  ]);
});

it('calls listZones and returns zones', async () => {
  const result = await permitActions.listZones();
  expect(result).toEqual([
    { id: '1', name: 'Zone 1' },
    { id: '2', name: 'Zone 2' }
  ]);
});

it('calls add and expects it to be called with parameters', async () => {
  const spy = vi.spyOn(permitActions, 'add');
  await permitActions.add('1', '1', '1');
  expect(spy).toHaveBeenCalledWith('1', '1', '1');
});

it('calls getPermitCountInZone and expects it to return a number', async () => {
  vi.spyOn(permitActions, 'getPermitCountInZone').mockResolvedValueOnce(3);
  const count = await permitActions.getPermitCountInZone('1');
  expect(count).toBe(3);
});