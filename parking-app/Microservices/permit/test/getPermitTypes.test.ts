import {afterAll, beforeAll, beforeEach, expect, test} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'
import * as db from './db'
import {app, bootstrap } from '../src/app'
import { vi } from 'vitest'
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

const correctDriverToken = 'driver-token';
const correctAdminToken = 'admin-token';
/******Customized Variables******/

const mockFetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method?.toUpperCase() || 'GET';
  const headers = new Headers (init?.headers).get('Authorization');
  const accessToken = headers?.split(' ')[1];

  if (method === 'GET' && url === 'http://localhost:5200/api/v0/check') {
    if (accessToken) {
      if (accessToken) {
        if (accessToken === correctDriverToken) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: bobDriver.id, name: bobDriver.name, roles: ['driver'] }),
          } as Response;
        }

        if (accessToken === correctAdminToken) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: bobDriver.id, name: bobDriver.name, roles: ['admin'] }),
          } as Response;
        }
      }
    }
    throw new Error('Unauthorized');
  }

  return Promise.reject(new Error(`Unknown route or method: ${method} ${url}`));
});

global.fetch = mockFetch as unknown as typeof fetch;

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

test('Unauthorized dirver can\'t get all permit types', async () =>{
    await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer wrong-token')
    .send({
        query: 
        `query GetPermitTypes {
            getPermitTypes {
                id
                type
                price
                totalAmount
            }
        }`
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data).toBeNull();
    })
});

test('Authorized driver successfully get all permit types', async () =>{
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctDriverToken}`)
    .send({
      query: `
        query GetPermitTypes {
          getPermitTypes {
            id
            type
            price
          }
        }`,
    })
    .expect(200)
    .then((res)=>{
      expect(res.body?.data?.getPermitTypes.length).toBe(6);
    });
});

test('Admin can get max permits for zone A', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctAdminToken}`)
    .send({
      query: `
        query {
          getZoneMaxPermits(zone: "A")
        }
      `,
    })
    .expect(200)
    .then((res) => {
      const max = res.body?.data?.getZoneMaxPermits;
      console.log('Max permits for zone A:', max);
      expect(typeof max).toBe('number');
      expect(max).toBeGreaterThan(0);
    });
});

test('Admin can set max permits for zone A', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctAdminToken}`)
    .send({
      query: `
        mutation {
          setZoneMaxPermits(zone: "A", limit: 7)
        }
      `,
    })
    .expect(200)
    .then((res) => {
      expect(res.body?.data?.setZoneMaxPermits).toBe(true);
    });
});

test('Expect false from setZoneMaxPermits', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctAdminToken}`)
    .send({
      query: `
        mutation {
          setZoneMaxPermits(zone: "unknown", limit: 7)
        }
      `,
    })
    .then((res) => {
      console.log('Response from setZoneMaxPermits:', res.body);
      expect(res.body.data.setZoneMaxPermits).toBe(false);
    })
});

test('Driver cannot set max permits for zone A', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctDriverToken}`)
    .send({
      query: `
        mutation {
          setZoneMaxPermits(zone: "A", limit: 10)
        }
      `,
    })
    .expect(200)
    .then((res) => {
      expect(res.body?.data).toBeNull();
      expect(res.body?.errors?.[0]?.message).toContain("Access denied! You don't have permission for this action!");
    });
});

test('getZoneMaxPermits returns null when zone not found', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctAdminToken}`)
    .send({
      query: `
        query {
          getZoneMaxPermits(zone: "Z")
        }
      `,
    })
    .expect(200)
    .then((res) => {
      expect(res.body?.data?.getZoneMaxPermits).toBeNull();
    });
});
