import { afterAll, beforeAll, beforeEach, expect, test, vi, it} from 'vitest';
import supertest from 'supertest';
import * as http from 'http';
import * as db from './db';
import {app, bootstrap } from '../src/app'
import { randomUUID } from 'crypto';

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

const originalFetch = global.fetch;

const bobDriver = {
  id: randomUUID(),
  name: 'Bob',
};
const correctToken = 'correct-token';
const validPermitTypeId = '93f9770b-64fd-4064-aeb2-8616b5c465fe';
const validVehicleId = randomUUID();
const validZoneTypeId = 'b6d8e5f9-dad9-4f9b-9588-94bc2ee670ab';

const validVehicleId2 = randomUUID();

const mockFetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method?.toUpperCase() || 'GET';
  const headers = new Headers(init?.headers).get('Authorization');
  const accessToken = headers?.split(' ')[1];

  if (method === 'GET' && url === 'http://localhost:5200/api/v0/check') {
    if (accessToken) {
      if (accessToken === correctToken) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: bobDriver.id, name: bobDriver.name, roles: ['driver', 'admin', 'enforcement'] }),
        } as Response;
      }
    }
    throw new Error('Unauthorized');
  }

  if (method === 'POST' && url === 'http://localhost:5150/graphql') {
    const body = JSON.parse(init?.body as string || '{}');
    const vehicleId = body.variables?.vehicleId;

    if (vehicleId === validVehicleId2) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            getPermitByVehicle: {
              id: 'permit-id-456',
              plate: 'XYZ789',
              zone: 'B',
              issuedAt: new Date().toISOString(),
            }
          }
        })
      } as Response
    }

    if (vehicleId === validVehicleId) {
      if (body.query.includes('getPermitByVehicle')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              getPermitByVehicle: {
                id: 'permit-id-123',
                plate: 'ABC123',
                zone: 'A',
                issuedAt: new Date().toISOString(),
              },
            },
          }),
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            vehicleById: { id: vehicleId, plate: 'ABC123' },
          },
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

vi.mock('../src/mail/mail', () => ({
  sendPermitReceipt: vi.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  server = http.createServer(app);
  server.listen();
  await db.reset();
  await bootstrap();
});

afterAll(() => {
  global.fetch = originalFetch;
  db.shutdown();
  server.close();
});

beforeEach(async () => {
  await db.reset();
});

test('Get permit by vehicle ID successfully', async () => {
  // Buy a permit
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
      query: `
        mutation BuyPermit($permitTypeId: String!, $vehicleId: String!, $zoneTypeId: String!) {
          buyPermit(permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneTypeId) {
            id
            vehicleId
            permitTypeId
            driverId
            startTime
            endTime
          }
        }
      `,
      variables: {
        permitTypeId: validPermitTypeId,
        vehicleId: validVehicleId,
        zoneTypeId: validZoneTypeId,
      },
    })
    .expect(200)
    .then((res) => {
      expect(res.body?.data?.buyPermit).not.toBeNull();
    });

  // Now query getPermitByVehicle
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
      query: `
        query GetPermitByVehicle($vehicleId: String!) {
          getPermitByVehicle(vehicleId: $vehicleId) {
            id
            plate
            zone
          }
        }
      `,
      variables: {
        vehicleId: validVehicleId,
      },
    })
    .expect(200)
    .then((res) => {
      console.log("getPermitByVehicle response:", JSON.stringify(res.body, null, 2));
      expect(res.body?.data?.getPermitByVehicle).toBeDefined();
      expect(res.body.data.getPermitByVehicle.plate).toBe('ABC123');
    });
});

it('Throws error if vehicle ID is invalid', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
      query: `
        query GetPermitByVehicle($vehicleId: String!) {
          getPermitByVehicle(vehicleId: $vehicleId) {
            id
            plate
            zone
          }
        }
      `,
      variables: {
        vehicleId: 'invalid-id-123',
      },
    })
    .expect(200)
    .then((res) => {
      console.log("Invalid vehicle ID response:", JSON.stringify(res.body, null, 2));
      expect(res.body.data).toBeNull();
      expect(res.body.errors?.[0]?.message).toContain('Invalid vehicle id');
    });
});

it('Throws error if vehicle has no permit', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${correctToken}`)
    .send({
      query: `
        query GetPermitByVehicle($vehicleId: String!) {
          getPermitByVehicle(vehicleId: $vehicleId) {
            id
            plate
            zone
          }
        }
      `,
      variables: {
        vehicleId: validVehicleId2,
      },
    })
    .expect(200)
    .then((res) => {
      console.log("No permit response:", JSON.stringify(res.body, null, 2));
      expect(res.body.errors?.[0]?.message).toContain("Vehicle doesn't have a permit");
    });
});