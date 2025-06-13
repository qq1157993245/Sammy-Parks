import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'
import * as db from './db'

import app from '../src/app'

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(() => {
  server = http.createServer(app)
  server.listen()
})

afterAll(() => {
  server.close()
})
beforeEach(async () => {

  return db.reset()
})

export interface Member {
  email: string
  password: string
  name: string
}

export const molly = {
  email: 'molly@books.com',
  password: 'mollymember',
  name: 'Molly Member',
}

export const anna = {
  email: 'anna@books.com',
  password: 'annaadmin',
  name: 'Anna Admin',
}

export async function driverloginAs(member: Member): Promise<string | undefined> {
  let accessToken
  await supertest(server)
    .post('/api/v0/driver-login')
    .send({
      email: member.email,
      password: member.password,
    })
    .expect(200)
    .then((res) => {
      accessToken = res.body.accessToken
    })
  return accessToken
}

export async function adminloginAs(member: Member): Promise<string | undefined> {
  let accessToken
  await supertest(server)
    .post('/api/v0/admin-login')
    .send({
      email: member.email,
      password: member.password,
    })
    .expect(200)
    .then((res) => {
      accessToken = res.body.accessToken
    })
  return accessToken
}

test('Missing Password in Login', async () => {
  await supertest(server)
    .post('/api/v0/driver-login')
    .send({ email: 'molly@books.com' })
    .expect(400)
})

test('Missing Body in Login', async () => {
  await supertest(server)
    .post('/api/v0/driver-login')
    .send()
    .expect(400)
})

test('OAuth Login with Null ID', async () => {
  await supertest(server)
    .post('/api/v0/oauth-driver-login')
    .send({ id: null, email: 'test@test.com', name: 'Test' })
    .expect(400)
})

test('Missing Auth Header for /check', async () => {
  await supertest(server)
    .get('/api/v0/check')
    .expect(401)
})

test('Malformed JWT', async () => {
  await supertest(server)
    .get('/api/v0/check')
    .set('Authorization', 'Bearer abc.def')
    .expect(401)
})

test('Driver accessing admin-only route', async () => {
  const token = await driverloginAs(molly)
  await supertest(server)
    .get('/api/v0/drivers')
    .set('Authorization', `Bearer ${token}`)
    .expect(401)
})

test('Short Police API key', async () => {
  await supertest(server)
    .get('/api/v0/check-police-key?key=short')
    .expect(500)
})

test('Valid format but unused Police API key', async () => {
  const fakeKey = 'a'.repeat(64)
  await supertest(server)
    .get(`/api/v0/check-police-key?key=${fakeKey}`)
    .expect(404)
})

test('Check terms without token', async () => {
  await supertest(server)
    .get('/api/v0/check-terms')
    .expect(401)
})

test('Accept terms without token', async () => {
  await supertest(server)
    .post('/api/v0/accept-terms')
    .expect(401)
})

test('Get ID by invalid email format', async () => {
  await supertest(server)
    .get('/api/v0/get-id-by-email?email=not-an-email')
    .expect(404)
})

test('Get ID by missing email param', async () => {
  await supertest(server)
    .get('/api/v0/get-id-by-email')
    .expect(400)
})

test('Admin tries to suspend nonexistent driver', async () => {
  const token = await adminloginAs(anna)
  await supertest(server)
    .post('/api/v0/suspend-driver')
    .set('Authorization', `Bearer ${token}`)
    .send({ id: 'nonexistent-id', suspend: true })
    .expect(400)
})
