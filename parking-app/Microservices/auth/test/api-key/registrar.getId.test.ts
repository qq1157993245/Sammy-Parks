import {it, beforeAll, afterAll, expect} from 'vitest';
import * as http from 'http'
import supertest from 'supertest'

import * as db from '../db'
import app from '../../src/app'

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

beforeAll( async () => {
  server = http.createServer(app)
  server.listen()
  await db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
})

// const key = 'ca116f155eee62b9a99ad2045c92d6fcc0737b39256d7aefac9311bcaaad1c0b'
// const invalidKey = '000057e4e4b5178ef360b1e1c3b1b88c2fcce0b82eb7bf7d9b2a2555a7393d0f'

it('Get docs', async () => {
  await supertest(server)
    .get('/api/v0/docs')
})

it('Returns 404 for bad email', async () => {
  await supertest(server)
    .get('/api/v0/get-id-by-email')
    .query({ email: 'invalid-email' })
    .expect(404)
})

it('Returns 404 for unknown email', async () => {
  await supertest(server)
    .get('/api/v0/get-id-by-email')
    .query({ email: 'unknown-email@example.com' })
    .expect(404)
})

it('Returns 200 for valid email', async () => {
  await supertest(server)
    .get('/api/v0/get-id-by-email')
    .query({ email: 'molly@books.com' })
    .expect(200)
})

it('Returns id', async () => {
  await supertest(server)
    .get('/api/v0/get-id-by-email')
    .query({ email: 'molly@books.com' })
    .then((response) => {
      const body = response.body
      expect(body.id).toBeDefined()
    })
})