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

test('Successfully get all the zone types', async () =>{
    await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
        query: 
        `query GetZoneTypes {
            getZoneTypes{
                id
                zone
                maxPermits
            }
        }`
    })
    .expect(200)
    .then((res)=>{
        expect(res.body?.data?.getZoneTypes.length).toBe(3);
    })
});