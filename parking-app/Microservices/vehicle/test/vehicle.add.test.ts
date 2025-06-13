import {it, beforeAll, afterAll, expect, vi} from 'vitest';
import * as http from 'http'
import supertest from 'supertest'

import * as db from './db'
import { app, bootstrap } from '../src/app'
import { check } from '../src/auth/service'

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

const fakeJwt = 'valid-jwt'
const uuid1 = '123e4567-e89b-12d3-a456-426614174000'

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

// from
// https://ihateregex.io/expr/uuid/
const pattern = 
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i

const vehicle1 = {
  plate: "ABC123",
  state: "California"
}

it('Vehicle query is unsuccessful without jwt', async () => {
  await supertest(server)
    .post('/graphql')
    .send({query: `
        mutation {
          addVehicle (
            vehicle: {plate: "${vehicle1.plate}", state: "${vehicle1.state}"}
          ) {
            id,
            plate
          }
        }
    `})
    .then((response) => {
      expect(response.body.errors).toBeDefined()
    })
})

it('Vehicle Mutator returns plate', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + fakeJwt)
    .send({query: `
        mutation {
          addVehicle (
            vehicle: {plate: "${vehicle1.plate}", state: "${vehicle1.state}"}
          ) {
            id,
            plate
          }
        }
    `})
    .then((response) => {
      expect(response.body.data.addVehicle.plate).toBe(vehicle1.plate)
    })
})

it('Vehicle Mutator returns UUID', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + fakeJwt)
    .send({query: `
        mutation {
          addVehicle (
            vehicle: {plate: "${vehicle1.plate}", state: "${vehicle1.state}"}
          ) {
            id,
            plate
          }
        }
    `})
    .then((response) => {
      expect(response.body.data.addVehicle.id).toMatch(pattern)
    })
})

it('Vehicle Mutator returns state', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + fakeJwt)
    .send({query: `
        mutation {
          addVehicle (
            vehicle: {plate: "${vehicle1.plate}", state: "${vehicle1.state}"}
          ) {
            id,
            plate,
            state
          }
        }
    `})
    .then((response) => {
      expect(response.body.data.addVehicle.state).toBe(vehicle1.state)
    })
})

it('Vehicle Mutator updates database', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + fakeJwt)
    .send({query: `
        mutation {
          addVehicle (
            vehicle: {plate: "${vehicle1.plate}", state: "${vehicle1.state}"}
          ) {
            id,
            plate
          }
        }
    `})
    .then((response) => {
      expect(response.body.data.addVehicle.id).toMatch(pattern)
    })

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
      expect(response.body.data.vehicle[0].plate).toBe(vehicle1.plate)
    })
})