
import { it, beforeAll, afterAll, vi, afterEach, beforeEach } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import app from '../src/app'
import { check, getIdByEmail } from '../src/auth/service';
import { TicketService } from '../src/ticket/ticketService';

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
    getIdByEmail: vi.fn(),
  }));
})

afterEach(() => {
  vi.restoreAllMocks()
})

const url = `/api/v0`
const key = 'ca116f155eee62b9a99ad2045c92d6fcc0737b39256d7aefac9311bcaaad1c0b'


it('Fetch docs', async () => {
  await supertest(server)
    .post('/api/v0/docs')
    .expect(200)
})

it('Throws error with no api key', async () => {
  (check as ReturnType<typeof vi.fn>)
    .mockRejectedValue(new Error('Unauthorized'))

  await supertest(server)
    .get(`${url}/ticket/check`)
    .query({name: ''})
    .expect(401)
})

it('Returns 404 when user is not found', async () => {
  (getIdByEmail as ReturnType<typeof vi.fn>)
    .mockResolvedValue(undefined)

  vi.spyOn(TicketService.prototype, 'checkTicket')
    .mockResolvedValue([])

  await supertest(server)
    .get(`${url}/ticket/check`)
    .set('Authorization', key)
    .query({email: 'mol@books.com'})
    .expect(404)
})

it('Returns 404 when TicketService fails', async () => {
  (getIdByEmail as ReturnType<typeof vi.fn>)
    .mockResolvedValue({ id: '12345', name: 'Test User' })

  vi.spyOn(TicketService.prototype, 'checkTicket')
    .mockResolvedValue(undefined)
 
  await supertest(server)
    .get(`${url}/ticket/check`)
    .set('Authorization', key)
    .query({email: 'molly@books.com'})
    .expect(404)
})

it('Returns 200 when user is found', async () => {
  (getIdByEmail as ReturnType<typeof vi.fn>)
    .mockResolvedValue({ id: '12345', name: 'Test User' })

  vi.spyOn(TicketService.prototype, 'checkTicket')
    .mockResolvedValue([])
 
  await supertest(server)
    .get(`${url}/ticket/check`)
    .set('Authorization', key)
    .query({email: 'molly@books.com'})
    .expect(200)
})


/*
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
*/