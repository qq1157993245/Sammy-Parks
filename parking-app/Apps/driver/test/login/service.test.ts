import { it, vi, expect } from 'vitest'
import { authenticate, check, grabuuidfromoauth, createNewAccount } from '../../src/auth/service'

vi.mock("server-only", () => {return {}})

it('Fail check', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 404,
      json: () => Promise.resolve(''),
    } as Response),
  )
  await expect(check('')).rejects.toEqual('Unauthorized')
})

it('Fail authenticate', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 404,
      json: () => Promise.resolve(''),
    } as Response),
  )
  await expect(authenticate({'email': '', 'password': ''})).resolves.toBeUndefined()
})

it('Fail get UUID', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 404,
      json: () => Promise.resolve(''),
    } as Response),
  )
  await expect(grabuuidfromoauth('any', 'molly@books.com', 'mollymember')).rejects.toEqual("Unexpected Error")
})

it('Fail create account', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 404,
      json: () => Promise.resolve(''),
    } as Response),
  )
  await expect(createNewAccount({email: 'molly@books.com', password: 'mollymember'})).resolves.toBeUndefined()
})

it('Check', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({'roles': ['driver']})
    } as Response),
  )
  expect(await check('')).toEqual({'roles': ['driver']})
})

it('Fail check on roles', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({'roles': []})
    } as Response),
  )
  await expect(check('')).rejects.toEqual('Unauthorized')
})

it('Authenticate', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve(''),
    } as Response),
  )
  expect(await authenticate({'email': 'molly@books.com', 'password': 'mollymember'})).toEqual('')
})

it('Gets UUID from OAuth', async () => {
  await expect(grabuuidfromoauth('any', 'molly@books.com', 'mollymember')).resolves.toEqual('')
})

it('Creates new account', async () => {
  await expect(createNewAccount({email: 'molly@books.com', password: 'mollymember'})).resolves.toEqual('')
})