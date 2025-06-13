import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
// import { act } from '@testing-library/react';

// Mocks
vi.mock('server-only', () => ({}));

vi.mock('next-intl/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  createNavigation: vi.fn(() => ({
    Link: vi.fn(),
    redirect: vi.fn(),
    usePathname: vi.fn(() => '/'),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
    })),
    getPathname: vi.fn(() => '/'),
  })),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  notFound: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: () => ({ value: 'mocked_session' }),
  })),
}));

vi.mock('@/auth/service', () => ({
  check: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/components/admin/actions', () => ({
  getDriverAccounts: vi.fn(() => Promise.resolve([])),
  getEnforcementAccounts: vi.fn(() => Promise.resolve([])),
  fetchTicketsForAdmin: vi.fn(() => Promise.resolve([])),
}));

vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: any) => <>{children}</>,
  hasLocale: vi.fn(() => true),
}));

vi.mock('@/components/LocaleSwitcher', () => {
  console.log('Mocking LocaleSwitcher');
  return {
    default: () => <div>Mock Locale Switcher</div>,
  };
});
vi.mock('@/components/admin/View', () => ({
  default: () => <div>Mock Admin View</div>
}));

import RootLayout from '@/app/[locale]/layout';
import AdministrationPage from '@/app/[locale]/page';

it('basic test always passes', () => {
  expect(true).toBe(true);
});

it('renders RootLayout with children', async () => {
  const layoutParams = Promise.resolve({ locale: 'en' });
  const result = await RootLayout({
    params: layoutParams,
    children: <div>LayoutChild</div>,
  });

  const { container } = render(result as React.ReactElement);
  expect(container.textContent).toContain('LayoutChild');
});

it('renders AdministrationPage', async () => {
  render(await AdministrationPage());
  
  expect(screen.getByText('Mock Admin View')).toBeTruthy();
});

it('calls notFound when locale is invalid', async () => {
  vi.resetModules();

  const mockNotFound = vi.fn();
  const mockHasLocale = vi.fn(() => false);

  vi.doMock('next/navigation', () => ({
    notFound: mockNotFound,
  }));

  vi.doMock('next-intl', () => ({
    hasLocale: mockHasLocale,
    NextIntlClientProvider: ({ children }: any) => <>{children}</>,
  }));

  const { default: Layout } = await import('@/app/[locale]/layout');

  await Layout({
    params: Promise.resolve({ locale: 'invalid-locale' }),
    children: <div>ShouldNotRender</div>,
  });

  console.log('notFound called:', mockNotFound.mock.calls);
  expect(mockNotFound).toHaveBeenCalled();
});