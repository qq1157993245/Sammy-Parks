// eslint-disable @typescript-eslint/no-explicit-any

import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi, afterEach, afterAll, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react';
import Page from '@/app/[locale]/page';
import { NextIntlClientProvider } from 'next-intl';
import en_messages from '../messages/en.json';
import { listTypes } from '@/components/enforcement/action';

vi.mock("server-only", () => { return {} })

vi.mock('@/components/check-plate/action', () => ({
  logout: vi.fn(() => Promise.resolve())
}))

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

const mockedPush = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockedPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: vi.fn(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

var listTypesMock: any;

vi.mock('../src/ticket/service', () => {
  listTypesMock = vi.fn();
  return {
    TicketService: class {
      listTypes = listTypesMock
    }
  };
});

beforeEach(() => {
  global.fetch = vi.fn()
})

afterEach(() => {
  cleanup();
});
afterAll(() => {
  vi.resetAllMocks()
})


test('Log out', async () => {
  listTypesMock.mockResolvedValue([])

  render(
    <NextIntlClientProvider locale="en" messages={en_messages}>
      <Page />
    </NextIntlClientProvider>
  );

  const logoutButton = screen.getByLabelText('log out');
  expect(logoutButton).toBeInTheDocument();
  fireEvent.click(logoutButton);

  await vi.waitFor(() => {
    expect(mockedPush).toHaveBeenCalledWith('/login');
  });
});
