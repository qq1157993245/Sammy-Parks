import { it, vi, expect } from 'vitest'
import { list, add } from '../../src/vehicle/service'

it('List vehicles unauthorized error', async () => {
  await expect(list('')).rejects.toEqual('Unauthorized')
})

it('Add vehicles unauthorized error', async () => {
  await expect(add('', {plate: 'ZZZ000', state: 'TX'})).rejects.toEqual('Unauthorized')
})

it('List vehicles json error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({errors: [{message: 'Unauthorized'}]}),
    } as Response),
  )
  await expect(list('')).rejects.toEqual('Unauthorized')
})

it('Add vehicles json error', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({errors: [{message: 'Unauthorized'}]}),
    } as Response),
  )
  await expect(add('', {plate: 'ZZZ000', state: 'TX'})).rejects.toEqual('Unauthorized')
})

it('List vehicles', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({data: {vehicle: [{id: '1', plate: 'ABC123'}]}}),
    } as Response),
  )
  expect(await list('')).toEqual([{id: '1', plate: 'ABC123'}])
})

it('Add vehicles', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({data: {vehicle: [{id: '1', plate: 'ZZZ000'}]}}),
    } as Response),
  )
  expect(await add('', {plate: 'ZZZ000', state: 'TX'})).toEqual([{id: '1', plate: 'ZZZ000'}])
})