import { describe, expect, it, vi } from 'vitest'
import Page from '../src/app/page'
import { render } from '@testing-library/react';
import mockRouter from 'next-router-mock';

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    redirect: vi.fn()
  };
});

describe('Landing Page', () => {
  it('should import without crashing', () => {
    // Do nothing, just import the module
    // This ensures the file is loaded and counted in coverage
    expect(Page).toBeDefined()
    render(
      <Page/>
    );
  })
})
