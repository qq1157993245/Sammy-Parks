import React from 'react';
import RootLayout from '../src/app/[locale]/layout';
import { expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: vi.fn()
}));

const mockChildren = <div>Test Child</div>;

it('calls notFound for invalid locale', async () => {
  const { notFound } = await import('next/navigation');
  const params = Promise.resolve({ locale: 'invalid' });
  await RootLayout({ params, children: mockChildren });
  expect(notFound).toHaveBeenCalled();
});