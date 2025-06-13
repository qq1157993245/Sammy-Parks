import {afterAll, beforeAll, beforeEach, expect, test, vi} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'
import * as db from './db'
import {app, bootstrap } from '../src/app'
import { randomUUID } from 'crypto'
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
const validVehicleId = randomUUID();
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
    if (vehicleId === vehicleId) {
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
    } as Response;
    }
  }
  return Promise.reject(new Error(`Unknown route or method: ${method} ${url}`));
});
global.fetch = mockFetch as unknown as typeof fetch;

// Important!
vi.mock('../src/mail/mail', () => ({
    sendPermitReceipt: vi.fn().mockResolvedValue(undefined),
}));

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

test('Unknown zone', async () =>{
    // Buy a permit
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
            vehicleId: validVehicleId,
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data?.buyPermit).not.toBeNull();
    })

    // Get permits
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `query GetPermitCountInZone ($zone: String!){
            getPermitCountInZone(zone: $zone)
        }`,
        variables: {
            zone: 'Q'
        }
    })
    .expect(200)
    .then((res)=>{
        console.log(res.body)
        expect(res.body?.data.getPermitCountInZone).toBe(0);
    })
});

test('Successfully get number of permits by zone', async () =>{
    // Buy a permit
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
                plate
                zone
            }
        }`, 
        variables: {
            permitTypeId: validPermitTypeId,
            vehicleId: validVehicleId,
            zoneTypeId: validZoneTypeId
        }
    })
    .expect(200)
    .then((res)=>{
        console.log(res.body)
        expect(res.body?.data?.buyPermit).not.toBeNull();
    })

    // Get permits
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `query GetPermitCountInZone ($zone: String!){
            getPermitCountInZone(zone: $zone)
        }`,
        variables: {
            zone: 'A'
        }
    })
    .expect(200)
    .then((res)=>{
        console.log(res.body)
        expect(res.body?.data.getPermitCountInZone).toBe(1);
    })
});