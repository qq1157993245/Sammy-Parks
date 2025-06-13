
import { it, beforeAll, afterAll, expect, vi, afterEach, beforeEach } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import app from '../src/app'
import { PermitService } from '../src/permit/permitService'
import { check } from '../src/auth/service';

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
})

afterAll(() => {
  server.close()
})

beforeEach(() => {
  vi.mock('../src/auth/service', () => ({
    check: vi.fn(),
  }));
})

afterEach(() => {
  vi.restoreAllMocks()
})

const url = `/api/v0`
const key = 'b31357e4e4b5178ef360b1e1c3b1b88c2fcce0b82eb7bf7d9b2a2555a7393d0f'

const mockPermit = {
  vehicleId: 'v1',
  startTime: 'now',
  endTime: 'later',
  plate: 'abc123',
  zone: 'Zone 1'
}


it('Fetch docs', async () => {
  await supertest(server)
    .post('/api/v0/docs')
    .expect(200)
})

it('Throws error with no api key', async () => {
  (check as ReturnType<typeof vi.fn>)
    .mockRejectedValue(new Error('Unauthorized'))

  await supertest(server)
    .get(`${url}/permit/check`)
    .query({vehiclePlate: ''})
    .expect(401)
})

it('Throws error when vehicle plate is missing', async () => {
  await supertest(server)
    .get(`${url}/permit/check`)
    .set('Authorization', key)
    .query({vehiclePlate: ''})
    .expect(500)
})

it('Throws error when vehicle plate is not included', async () => {
  await supertest(server)
    .get(`${url}/permit/check`)
    .set('Authorization', key)
    .expect(400)
})

it('Check permit for vehicle without permit', async () => {
  vi.spyOn(PermitService.prototype, 'checkPermit')
    .mockResolvedValue(undefined)

  await supertest(server)
    .get(`${url}/permit/check`)
    .set('Authorization', key)
    .query({vehiclePlate: '123Nice'})
    .expect(404)
})

it('Check for 200 response', async () => {
  vi.spyOn(PermitService.prototype, 'checkPermit')
    .mockResolvedValue(mockPermit)

  await supertest(server)
    .get(`${url}/permit/check`)
    .set('Authorization', key)
    .query({vehiclePlate: 'abc123'})
    .expect(200)
})

it('Check for response body', async () => {
  vi.spyOn(PermitService.prototype, 'checkPermit')
    .mockResolvedValue(mockPermit)

  await supertest(server)
    .get(`${url}/permit/check`)
    .set('Authorization', key)
    .query({vehiclePlate: 'abc123'})
    .then(res => {
      expect(res.body.plate).toBe(mockPermit.plate)
    })
})
