import * as jwt from "jsonwebtoken"
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

const uuid1 = '123e4567-e89b-12d3-a456-426614174000'

it('Get docs', async () => {
  await supertest(server)
    .get('/api/v0/docs')
})

it('Returns 404 for invalid driverId', async () => {
  await supertest(server)
    .post('/api/v0/get-email')
    .send({ driverId: uuid1 })
    .expect(404)
})

it('Returns 200 for valid driverId', async () => {
  let decoded: { id: string } = { id: '' }
  await supertest(server)
    .post('/api/v0/driver-login')
    .send({ email: "molly@books.com", password: "mollymember" })
    .then((response) => {
      const token = response.body.accessToken
      decoded = jwt.verify(token, `${process.env.MASTER_SECRET}`) as { id: string }
    })

  await supertest(server)
    .post('/api/v0/get-email')
    .send({ driverId: decoded.id })
    .expect(200)
})
