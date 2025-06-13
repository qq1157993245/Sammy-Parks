import {it, beforeAll, afterAll, expect, vi} from 'vitest';
import * as http from 'http'
import supertest from 'supertest'

import * as db from './db'
import { app, bootstrap } from '../src/app'
import { check } from '../src/auth/service'

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

const uuid1 = '123e4567-e89b-12d3-a456-426614174000'
const fakeJwt = 'valid-jwt'

vi.mock('../src/auth/service', () => ({
  check: vi.fn()
}))

beforeAll( async () => {
  server = http.createServer(app)
  server.listen()
  await db.reset()
  await bootstrap()

  vi.mocked(check).mockImplementation((jwt) => {
    if (jwt === fakeJwt) {
      return Promise.resolve(uuid1)
    } else {
      return Promise.reject('Unauthorized')
    }
  })
})

afterAll(() => {
  db.shutdown()
  server.close()
})


it('Vehicle query is successful with jwt', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + fakeJwt)
    .send({query: `
        query {
          vehicle {
            id,
            plate
          }
        }
    `})
    .then((response) => {
      expect(response.body.errors).toBeUndefined()
    })
})

it('Vehicle query is unsuccessful without jwt', async () => {
  await supertest(server)
    .post('/graphql')
    .send({query: `
        query {
          vehicle {
            id,
            plate
          }
        }
    `})
    .then((response) => {
      expect(response.body.errors).toBeDefined()
    })
})

it('Vehicle query is returns plate', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + fakeJwt)
    .send({query: `
        mutation {
          addVehicle (
            vehicle: {plate: "ABC123", state: "California"}
          ) {
            id,
            plate
          }
        }
    `})

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + fakeJwt)
    .send({query: `
        query {
          vehicle {
            id,
            plate
          }
        }
    `})
    .then((response) => {
      expect(response.body.data.vehicle[0].plate).toBe('ABC123')
    })
})