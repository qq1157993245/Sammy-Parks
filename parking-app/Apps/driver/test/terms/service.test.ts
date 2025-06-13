import { it, vi, expect } from 'vitest'
import { TermService } from '../../src/terms/service'

vi.mock("server-only", () => {return {}})

it('Check terms', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve(true)
    } as Response),
  )
  await expect(new TermService().checkterms(undefined)).resolves.toEqual(true)
})

it('Fail check terms', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 404,
      json: () => Promise.resolve(true)
    } as Response),
  )
  await expect(new TermService().checkterms(undefined)).rejects.toEqual('Unexpected Error')
})

it('Accept terms', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve('')
    } as Response),
  )
  await expect(new TermService().acceptterms(undefined)).resolves.toEqual('')
})

it('Fail accept terms', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 404,
      json: () => Promise.resolve('')
    } as Response),
  )
  await expect(new TermService().acceptterms(undefined)).rejects.toEqual('Unexpected Error')
})

it('Decline terms', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve(true)
    } as Response),
  )
  await expect(new TermService().declineterms(undefined)).resolves.toEqual(true)
})

it('Fail decline terms', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 404,
      json: () => Promise.resolve(true)
    } as Response),
  )
  await expect(new TermService().declineterms(undefined)).rejects.toEqual('Unexpected Error')
})