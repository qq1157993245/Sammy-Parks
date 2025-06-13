import { describe, it, expect, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (key: string) => {
      if (key === 'session') {
        return { value: 'mock-session-cookie' }
      }
      return undefined
    },
  }),
}))

vi.mock('@/components/login/actions', () => ({
  logout: vi.fn(), 
}))

vi.mock('@/terms/service', () => {
  return {
    TermService: vi.fn().mockImplementation(() => ({
      checkterms: vi.fn().mockResolvedValue(true),
      acceptterms: vi.fn().mockResolvedValue('done'),
      declineterms: vi.fn().mockResolvedValue(true),
    })),
  }
})


import * as TermActions from '../../src/components/terms/actions'

describe('server actions', () => {
  it('checkterms works', async () => {
    const result = await TermActions.checkterms()
    expect(result).toBe(true)
  })

  it('accepterms works', async () => {
    const result = await TermActions.accepterms()
    expect(result).toBe('done')
  })

  it('declineterms works', async () => {
    const result = await TermActions.declineterms()
    expect(result).toBe(true)
  })
})
