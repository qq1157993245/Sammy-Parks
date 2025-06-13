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

vi.mock('../../src/components/login/actions', async () => {
  return {
    logout: vi.fn()
  }
})

vi.mock('../../src/components/permit/actions', async () => {
  return {
    listTypes: vi.fn(async () => {
      return [{type: 'Day'}]
    }),
    list: vi.fn(),
    add: vi.fn(async () => {
      return {plate: 'ZZZ000'}
    }),
    listZones: vi.fn(async () => {
      return [{zone: 'A', id: '1', maxPermits: 100}];
    }),
    getPermitCountInZone: vi.fn(),
  }
})

vi.mock('../../src/components/vehicle/actions', async () => {
  return {
    listAction: vi.fn(),
  }
})

vi.mock('../../src/components/stripe/actions', async () => {
  return {
    createCheckout: vi.fn(async () => {
      return 'https://stripe.com/checkout/session_id';
    }),
  }
})

vi.mock('../../src/components/terms/actions', async () => {
  return {
    checkterms: vi.fn(async () => true),
    accepterms: vi.fn(),
    declineterms: vi.fn()
  }
})

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
      get: vi.fn(() => {
        return {
          value: 'fakesession'
        }
      }),
    }
  })
}))

vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    useSession: () => ({
      data: { user: { name: 'Test User' } },
      status: 'authenticated'
    }),
  };
});

it('Renders', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  expect(await screen.getByText('Permits'))
})

it('Displays no permits message', async () => {
  const { list } = await import('../../src/components/permit/actions');
  vi.mocked(list).mockResolvedValue([])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  )
  expect(await screen.findByText('No active permits!'))
})

it('Displays permits', async () => {
  const { list } = await import('../../src/components/permit/actions');
  vi.mocked(list).mockResolvedValue([{
    plate: 'ABC123', 
    id: '', 
    startTime: '', 
    endTime: '', 
    vehicleId: '',
    zone: 'A'
  }])
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  )
  await waitFor(async () => {
    expect(await screen.getByText('Vehicle: ABC123'))
  })
})

it('Opens buy permit dialog', async () => {
  const { listAction } = await import('../../src/components/vehicle/actions');
  vi.mocked(listAction).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]);
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await waitFor(async () => {
    fireEvent.click(screen.getByText('Buy Permit'))
    expect(screen.getByText('Permit Type'))
  })
})

it('getPermitCountInZone doesnt return a number', async () => {
  const { listAction } = await import('../../src/components/vehicle/actions');
  vi.mocked(listAction).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]);
  const { getPermitCountInZone } = await import('../../src/components/permit/actions');
  vi.mocked(getPermitCountInZone).mockResolvedValueOnce('not a number' as unknown as number);
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(await screen.findByText('Buy Permit'))
  await waitFor(async () => {
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')
  })
  expect(await screen.getByText('Could not verify permit availability.'))
})

it('A zone does not have enough permits', async () => {
  const { listAction } = await import('../../src/components/vehicle/actions');
  vi.mocked(listAction).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]);
  const { getPermitCountInZone } = await import('../../src/components/permit/actions');
  vi.mocked(getPermitCountInZone).mockResolvedValueOnce(999);
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(await screen.findByText('Buy Permit'))
  await waitFor(async () => {
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')
  })
  expect(await screen.getByText(/No more permits available in zone/))
})

it('getPermitCountInZone throws an error', async () => {
  const { listAction } = await import('../../src/components/vehicle/actions');
  vi.mocked(listAction).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]);
  const { getPermitCountInZone } = await import('../../src/components/permit/actions');
  vi.mocked(getPermitCountInZone).mockRejectedValueOnce(new Error('Test error'));
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await waitFor(async () => {
    fireEvent.click(screen.getByText('Buy Permit'))
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')
  })
})

it('Closes buy permit dialog', async () => {
  const { listAction } = await import('../../src/components/vehicle/actions');
  vi.mocked(listAction).mockResolvedValueOnce([
    { plate: 'ABC123', id: '1', state: 'CA' },
  ]);
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await waitFor(async () => {
    fireEvent.click(screen.getByText('Buy Permit'))
  })
  await waitFor(async () => {
    fireEvent.click(screen.getByText('Cancel'))
    expect(await !screen.getByText('Permit Type'))
  })
})

it('Opens nav drawer', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('menu'))
  expect(await screen.getByText('Vehicles'))
})


it('Navigates to profile page from bottom bar', async () => {
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  fireEvent.click(screen.getByLabelText('profile button'))
  await waitFor(async () => {
    expect(mockRouter.asPath).toBe('/profile')
  })
})

it('stores user name in sessionStorage when authenticated', async () => {
  window.sessionStorage.clear();
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );

  expect(window.sessionStorage.getItem('name')).toBe("Test User");
});

it('Terms show if new driver', async () => {
  const { checkterms } = await import('../../src/components/terms/actions');
  vi.mocked(checkterms).mockResolvedValue(false)
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await waitFor(async () => {
    expect(screen.getByText('Terms of Service'))
  })
})

it('Accept terms as new driver', async () => {
  const { checkterms } = await import('../../src/components/terms/actions');
  vi.mocked(checkterms).mockResolvedValue(false)
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await waitFor(async () => {
    fireEvent.click(await screen.findByLabelText('Checkbox demo'))
    fireEvent.click(await screen.findByText('Agree'))
  })
  expect(screen.getByText('Permits'))
})

it('Decline terms as new driver', async () => {
  const { checkterms } = await import('../../src/components/terms/actions');
  vi.mocked(checkterms).mockResolvedValue(false)
  render(
    <IntlProvider locale="en" messages={en}>
      <Page />
    </IntlProvider>
  );
  await waitFor(async () => {
    fireEvent.click(await screen.findByText('Disagree'))
  })
  expect(mockRouter.asPath).toBe('/login');
})