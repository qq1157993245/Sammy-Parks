import {afterAll, beforeAll, beforeEach, expect, test} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'
import * as db from './db'
import {app, bootstrap } from '../src/app'
import { vi } from 'vitest'
import { randomUUID } from 'crypto'

/* eslint-disable @typescript-eslint/no-explicit-any */

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>
const originalFetch = global.fetch;
/******Customized Variables******/
const bobDriver = {
     id: randomUUID(),
     name: 'Bob',
};
const correctToken = 'correct-token';
const validPermitTypeId = '93f9770b-64fd-4064-aeb2-8616b5c465fe';
const validVehicleIds = Array.from({ length: 80 }, () => randomUUID());
const validZoneTypeId = 'b6d8e5f9-dad9-4f9b-9588-94bc2ee670ab';
/******Customized Variables******/
const mockFetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method?.toUpperCase() || 'GET';
  const headers = new Headers (init?.headers).get('Authorization');
  const accessToken = headers?.split(' ')[1];
  if (method === 'GET' && url === 'http://localhost:5200/api/v0/check') {
    if (accessToken) {
      if (accessToken === correctToken) {
        return {
          ok: true,
          status: 200,
          json: async () => ({id: bobDriver.id, name: bobDriver.name, roles: ["driver", "admin", "enforcement"]}),
        } as Response;
      }
    }
    throw new Error('Unauthorized');
  }
  if (method === 'POST' && url === 'http://localhost:5150/graphql') {
    const vehicleId = JSON.parse(init?.body as string || '{}').variables.vehicleId;
    if (validVehicleIds.includes(vehicleId)) {
      return {
          ok: true,
          status: 200,
          json: async () => ({  
            data: {
              "vehicleById": {id: vehicleId, plate: 'ABC123'},
            }
          }),
      } as Response;
    } else {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          errors: [
            {
              message: 'Invalid vehicle id',
            },
          ],
          data: null,
        }),
     
    } as any;
    }
  }
  return Promise.reject(new Error(`Unknown route or method: ${method} ${url}`));
});
global.fetch = mockFetch as unknown as typeof fetch;

// Important!
vi.mock('../src/mail/mail', () => ({
    sendPermitReceipt: vi.fn().mockResolvedValue(undefined),
}));

// --- Additional AuthCheck tests ---
test('Throws error when no JWT is provided', async () => {
  const { AuthCheck } = await import('../src/auth/checker'); // Adjust path if needed
  const mockRequest = {
    headers: {}  // No Authorization header
  } as any;

  await expect(() => AuthCheck(mockRequest)).rejects.toThrow('No JWT provided');
});

test('Throws error when fetch status is not 200 (unauthorized)', async () => {
  const { AuthCheck } = await import('../src/auth/checker'); // Adjust path if needed

  // Override fetch temporarily
  const originalFetch = global.fetch;
  global.fetch = vi.fn(async () => ({
    status: 401,
  })) as any;

  const mockRequest = {
    headers: {
      authorization: 'Bearer invalid-token'
    }
  } as any;

  await expect(() => AuthCheck(mockRequest)).rejects.toThrow('Unauthorized');

  global.fetch = originalFetch;
});

beforeAll(async () => {
    server = http.createServer(app)
    server.listen()
    await db.reset()
    await bootstrap()
})
  
afterAll(() => {
    global.fetch = originalFetch;
    db.shutdown()
    server.close()
});
beforeEach(async () => {
  await db.reset()
});
test('Unauthorized driver can\'t buy a permit', async () =>{
    await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + 'wrong-token123')
    .send({
        query: 
        `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
            buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                id
                vehicleId
                permitTypeId
                driverId
                startTime
                endTime
            }
        }`, 
        variables: {
            permitTypeId: validPermitTypeId,
            vehicleId: validVehicleIds[0],
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data).toBeNull();
    })
});
test('Can\'t buy a permit with an invalid permit-type id', async () =>{
    const permitTypeId = randomUUID()
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
            buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                id
                vehicleId
                permitTypeId
                driverId
                startTime
                endTime
            }
        }`, 
        variables: {
            permitTypeId: permitTypeId,
            vehicleId: validVehicleIds[0],
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data).toBeNull();
    })
});
test('Can\'t buy a permit with an invalid vehicle id', async () =>{
    const vehicleId = randomUUID()
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
            buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                id
                vehicleId
                permitTypeId
                driverId
                startTime
                endTime
            }
        }`, 
        variables: {
            permitTypeId: validPermitTypeId,
            vehicleId: vehicleId,
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data).toBeNull();
    })
});
test('Can\'t buy a permit with an invalid zone-type id', async () =>{
    const zoneTypeId = randomUUID();
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
            buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                id
                vehicleId
                permitTypeId
                driverId
                startTime
                endTime
            }
        }`, 
        variables: {
            permitTypeId: validPermitTypeId,
            vehicleId: validVehicleIds[0],
            zoneTypeId: zoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data).toBeNull();
    })
});
test('Can\'t buy a permit when permit is sold out', async () =>{
    for (let i = 0; i < 80; i++) {
      await supertest(server)
      .post('/graphql')
      .set('Authorization', `Bearer ${correctToken}`)
      .send({
          query: 
          `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
              buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                  id
                  vehicleId
                  permitTypeId
                  driverId
                  startTime
                  endTime
              }
          }`, 
          variables: {
              permitTypeId: validPermitTypeId,
              vehicleId: validVehicleIds[i],
              zoneTypeId: validZoneTypeId
          }
      })
    }
    validVehicleIds.push(randomUUID());
    await supertest(server)
      .post('/graphql')
      .set('Authorization', `Bearer ${correctToken}`)
      .send({
          query: 
          `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
              buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                  id
                  vehicleId
                  permitTypeId
                  driverId
                  startTime
                  endTime
              }
          }`, 
          variables: {
              permitTypeId: validPermitTypeId,
              vehicleId: validVehicleIds[validVehicleIds.length - 1],
              zoneTypeId: validZoneTypeId
          }
      })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data).toBeNull();
    })
});
test('Can\'t buy a permit when a vehicle already has a permit', async () =>{
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
            buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                id
                vehicleId
                permitTypeId
                driverId
                startTime
                endTime
            }
        }`, 
        variables: {
            permitTypeId: validPermitTypeId,
            vehicleId: validVehicleIds[0],
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
            buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                id
                vehicleId
                permitTypeId
                driverId
                startTime
                endTime
            }
        }`, 
        variables: {
            permitTypeId: validPermitTypeId,
            vehicleId: validVehicleIds[0],
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data).toBeNull();
    })
});
test(`An authorized driver can buy a permit with a valid vehicle id, a valid permit-type id 
    and a valid zone-type id`, async () =>{
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
            buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                id
                vehicleId
                permitTypeId
                driverId
                startTime
                endTime
            }
        }`, 
        variables: {
            permitTypeId: validPermitTypeId,
            vehicleId: validVehicleIds[0],
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data?.buyPermit).not.toBeNull();
    })
});
test('An authorized driver can buy a permit for two different vehicles', async () =>{
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
            buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                id
                vehicleId
                permitTypeId
                driverId
                startTime
                endTime
            }
        }`, 
        variables: {
            permitTypeId: validPermitTypeId,
            vehicleId: validVehicleIds[0],
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data?.buyPermit).not.toBeNull();
    })

    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `mutation BuyPermit ($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
            buyPermit (permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
                id
                vehicleId
                permitTypeId
                driverId
                startTime
                endTime
            }
        }`, 
        variables: {
            permitTypeId: validPermitTypeId,
            vehicleId: validVehicleIds[1],
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data?.buyPermit).not.toBeNull();
    })
});