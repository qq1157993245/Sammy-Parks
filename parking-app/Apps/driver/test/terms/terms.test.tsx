import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('next/navigation', async () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
    }),
  }
})

vi.mock('next-auth/react', async () => {
  const actual: any = await vi.importActual('next-auth/react')
  return {
    ...actual,
    signOut: () => signOutMock(),
    useSession: () => ({ data: null, status: 'unauthenticated' }),
  }
})

const signOutMock = vi.fn()
vi.mock('@/components/login/actions', () => ({
    logout: vi.fn(), 
  }))
  

import Terms from '../../src/components/terms/Terms'
import * as TermsActions from '../../src/components/terms/actions'
import { SessionProvider } from 'next-auth/react'
import { NextIntlClientProvider } from 'next-intl'
import en from '../../messages/en.json'

function WrappedTerms() {
  return (
    <SessionProvider session={null}>
      <NextIntlClientProvider locale="en" messages={en}>
        <Terms />
      </NextIntlClientProvider>
    </SessionProvider>
  )
}

describe('Terms Modal', () => {
  it('shows modal if terms not accepted', async () => {
    vi.spyOn(TermsActions, 'checkterms').mockResolvedValue(false)

    render(<WrappedTerms />)

    await waitFor(() => {
      const modalHeader = screen.getAllByText('Terms of Service')[0]
      expect(modalHeader).not.toBeNull()
    })
  })



  it('disagrees and signs out', async () => {
    vi.spyOn(TermsActions, 'checkterms').mockResolvedValue(false)
    vi.spyOn(TermsActions, 'declineterms').mockResolvedValue(true)

    render(<WrappedTerms />)

    await waitFor(() => {
      expect(screen.getAllByText('Terms of Service').length).toBeGreaterThan(0)
    })

    const disagreeBtn = screen.getByRole('button', { name: /disagree/i })
    fireEvent.click(disagreeBtn)

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled()
    })
  })
})
