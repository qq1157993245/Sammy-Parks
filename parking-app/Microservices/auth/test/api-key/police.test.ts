import {it, beforeAll, afterAll} from 'vitest';
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

const key = 'b31357e4e4b5178ef360b1e1c3b1b88c2fcce0b82eb7bf7d9b2a2555a7393d0f'
const invalidKey = '000057e4e4b5178ef360b1e1c3b1b88c2fcce0b82eb7bf7d9b2a2555a7393d0f'

it('Get docs', async () => {
  await supertest(server)
    .get('/api/v0/docs')
})

it('Returns 500 for malformed key', async () => {
  await supertest(server)
    .get('/api/v0/check-police-key')
    .query({ key: 'invalid-key' })
    .expect(500)
})

it('Returns 404 for invalid police API key', async () => {
  await supertest(server)
    .get('/api/v0/check-police-key')
    .query({ key: invalidKey })
    .expect(404)
})

it('Returns 200 for valid police API key', async () => {
  await supertest(server)
    .get('/api/v0/check-police-key')
    .query({ key })
    .expect(200)
})