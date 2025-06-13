import { afterAll, beforeAll, beforeEach, test } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'
import * as db from './db'
import { app, bootstrap } from '../src/app'

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
  await db.reset()
  await bootstrap()
})

afterAll(() => {
  db.shutdown()
  server.close()
})

beforeEach(async () => {
  await db.reset()
});


test('Police checks for vehicle', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `
        query {
          policeGetPermit(plate: "abc123") {
            id
            startTime
            endTime
            plate
            zone
          }
        }
      `,
    })
    .expect(200)
});
