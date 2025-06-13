import { beforeAll, afterAll, expect, vi, it} from 'vitest';
import supertest from 'supertest';
import * as http from 'http';
import { app, bootstrap } from '../src/app';
import * as testDb from './db';
import { Ticket, TicketData, TicketType } from '../src/ticket/schema'
import * as authService from '../src/auth/service';


vi.mock('../src/auth/service', async () => {
  const actual = await vi.importActual<typeof authService>('../src/auth/service');
  return {
    ...actual,
    check: vi.fn((token: string | undefined) => {
      if (!token || token === 'bad-token') throw new Error('Unauthorized');
      if (token === 'admin-token') return Promise.resolve({ id: 'admin-id', roles: ['admin'] });
      if (token === 'enforcer-token') return Promise.resolve({ id: 'enforcer-id', roles: ['enforcement'] });
      return Promise.resolve({ id: 'test-driver-1', roles: ['driver'] });
    })
  };
});

let server: http.Server;
let createdTicketId: string;
let testDriverId: string;

// Important! Make sure to include this to avoid sending email while testing
vi.mock('../src/mail/mail', () => ({
    sendTicketEmail: vi.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  await bootstrap();
  server = http.createServer(app);
  server.listen();
  await testDb.reset(); // Resets test DB using schema.sql (and optionally data.sql)

  global.fetch = vi.fn()
});

afterAll(async () => {
  await testDb.shutdown();
  server.close();
});

it('Create a ticket', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetch as any).mockImplementation(() => Promise.resolve({
    json: () => Promise.resolve({ 
      id: 'c00cb300-06ed-4a5d-be13-2870ab6a9d08',
      data: {
        driverId: 'c00cb300-06ed-4a5d-be13-2870ab6a9d08',
        violation: 'Illegal Parking',
        price: 50
      }
    }),
  }));

  const mutation = `
    mutation {
      createTicket(data: {
        driverId: "c00cb300-06ed-4a5d-be13-2870ab6a9d08",
        type: "6c95ad4e-0767-443e-b93a-5cbe4be39d6b"
      }) {
        id
        data {
          driverId
          violation
          price
        }
      }
    }
  `;

  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer enforcer-token')
    .send({ query: mutation })
    .expect(200);
  if (res.body.errors || !res.body.data?.createTicket) {
    console.error('Create Ticket Errors:', res.body.errors);
    console.error('Full response:', JSON.stringify(res.body, null, 2));
    throw new Error('Ticket creation failed');
  }
  expect(res.body.data?.createTicket).toBeDefined();
  createdTicketId = res.body.data.createTicket?.id;
  testDriverId = res.body.data.createTicket.data.driverId;
  expect(res.body.data.createTicket.data.driverId).toBe('c00cb300-06ed-4a5d-be13-2870ab6a9d08');
  expect(res.body.data.createTicket.data.violation).toBeDefined();
  expect(res.body.data.createTicket.data.price).toBeDefined();
  console.log('Created ticket ID:', createdTicketId);
});

it('Get tickets by driver (should include new ticket)', async () => {
  const query = `
    query {
      ticketsByDriver(driverId: "${testDriverId}") {
        id
        data {
          driverId
          violation
          paid
        }
      }
    }
  `;

  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer admin-token')
    .send({ query })
    .expect(200);
  if (res.body.errors) console.error('Tickets By Driver Errors:', res.body.errors);
  expect(res.body.data).toBeDefined();
  expect(res.body.data.ticketsByDriver).toBeDefined();
  expect(res.body.data.ticketsByDriver.length).toBeGreaterThan(0);
  expect(res.body.data.ticketsByDriver[0].data.violation).toBeDefined();
  expect(res.body.data.ticketsByDriver[0].data.driverId).toBe('c00cb300-06ed-4a5d-be13-2870ab6a9d08');
});


it('Get all tickets (should return at least one)', async () => {
  const query = `
    query {
      tickets {
        id
        data {
          violation
          price
        }
      }
    }
  `;

  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer admin-token')
    .send({ query })
    .expect(200);
  if (res.body.errors) console.error('Get All Tickets Errors:', res.body.errors);
  expect(res.body.data).toBeDefined();
  expect(res.body.data.tickets).toBeDefined();
  expect(res.body.data.tickets.length).toBeGreaterThan(0);
  expect(res.body.data.tickets[0].data.violation).toBeDefined();
});

it('Get all tickets throws error due to role', async () => {
  const query = `
    query {
      tickets {
        id
        data {
          violation
          price
        }
      }
    }
  `;

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer enforcer-token')
    .send({ query })
    .then(response => {
      expect(response.body.errors).toBeDefined()
    })
});

it('Override a ticket by ID', async () => {
  if (!createdTicketId) throw new Error('Ticket ID not set from previous test');

  const mutation = `
    mutation {
      overrideTicket(id: "${createdTicketId}") {
        id
        data {
          overridden
        }
      }
    }
  `;

  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer admin-token')
    .send({ query: mutation })
    .expect(200);
  if (res.body.errors) console.error('Override Ticket Errors:', res.body.errors);
  expect(res.body.data?.overrideTicket).toBeDefined();
  expect(res.body.data.overrideTicket.data.overridden).toBe(true);
});

it('Override a ticket by ID fails due to role', async () => {
  if (!createdTicketId) throw new Error('Ticket ID not set from previous test');

  const mutation = `
    mutation {
      overrideTicket(id: "${createdTicketId}") {
        id
        data {
          overridden
        }
      }
    }
  `;

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer enforcer-token')
    .send({ query: mutation })
    .then(response => {
      expect(response.body.errors).toBeDefined();
    })
});

it('Override a ticket by ID fails missing ticket', async () => {
  const fakeuuid = '000cb300-06ed-4a5d-be13-2870ab6a9d08'
  const mutation = `
    mutation {
      overrideTicket(id: "${fakeuuid}") {
        id
        data {
          overridden
        }
      }
    }
  `;

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer admin-token')
    .send({ query: mutation })
    .then(response => {
      console.log('Response:', response.body.errors);
      expect(response.body.errors).toBeDefined();
    })
});

it('Mark ticket as paid', async () => {
  if (!createdTicketId) throw new Error('Ticket ID not set from previous test');

  const mutation = `
    mutation {
      payTicket(id: "${createdTicketId}") {
        id
        data {
          paid
        }
      }
    }
  `;

  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-driver-1')
    .send({ query: mutation })
    .expect(200);
  if (res.body.errors) console.error('Pay Ticket Errors:', res.body.errors);
  expect(res.body.data?.payTicket).toBeDefined();
  expect(res.body.data.payTicket.data.paid).toBe(true);
});

it('Ticket schema instance behaves as expected', () => {
  const data = new TicketData();
  data.driverId = 'd1';
  data.violation = 'Speeding';
  data.paid = false;
  data.overridden = false;
  data.issuedBy = 'admin';
  data.price = 100;
  data.createdAt = new Date().toISOString();

  const ticket = new Ticket();
  ticket.id = 't1';
  ticket.data = data;

  expect(ticket.data.violation).toBe('Speeding');
  expect(ticket.data.price).toBe(100);
});

it('Driver challenges a ticket', async () => {
  if (!createdTicketId) throw new Error('Ticket ID not set from previous test');

  const challengeMutation = `
    mutation {
      challengeTicket(id: "${createdTicketId}", message: "I wasn’t parked illegally") {
        id
        data {
          challengeMessage
          challenged
        }
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-driver-1')
    .send({ query: challengeMutation })
    .expect(200);

  if (res.body.errors) console.error('Challenge Ticket Errors:', res.body.errors);
  expect(res.body.data?.challengeTicket).toBeDefined();
  expect(res.body.data.challengeTicket.data.challengeMessage).toBe("I wasn’t parked illegally");
  expect(res.body.data.challengeTicket.data.challenged).toBe(true);
});


it('Admin denies a challenge', async () => {
  if (!createdTicketId) throw new Error('Ticket ID not set from previous test');

  const resolveMutation = `
    mutation {
      resolveChallenge(id: "${createdTicketId}", accept: false) {
        id
        data {
          challengeDenied
          challenged
        }
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer admin-token')
    .send({ query: resolveMutation })
    .expect(200);

  if (res.body.errors) console.error('Deny Challenge Errors:', res.body.errors);
  expect(res.body.data?.resolveChallenge).toBeDefined();
  expect(res.body.data.resolveChallenge.data.challengeDenied).toBe(true);
  expect(res.body.data.resolveChallenge.data.challenged).toBe(false);
});

it('Admin accepts a challenge', async () => {
  if (!createdTicketId) throw new Error('Ticket ID not set from previous test');

  const resolveMutation = `
    mutation {
      resolveChallenge(id: "${createdTicketId}", accept: true) {
        id
        data {
          challengeAccepted
          challenged
        }
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer admin-token')
    .send({ query: resolveMutation })
    .expect(200);

  if (res.body.errors) console.error('Accept Challenge Errors:', res.body.errors);
  expect(res.body.data?.resolveChallenge).toBeDefined();
  expect(res.body.data.resolveChallenge.data.challengeAccepted).toBe(true);
  expect(res.body.data.resolveChallenge.data.challenged).toBe(false);
});


it('Unauthorized access to ticketTypes', async () => {
  const query = `
    query {
      ticketTypes {
        id
        violation
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-driver-1')
    .send({ query })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0].message).toBe('Unauthorized');
});

it('Enforcement can access ticketTypes', async () => {
  const query = `
    query {
      ticketTypes {
        id
        violation
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer enforcer-token')
    .send({ query })
    .expect(200);

  if (res.body.errors) console.error('Enforcement ticketTypes Errors:', res.body.errors);
  expect(res.body.data?.ticketTypes).toBeDefined();
  expect(Array.isArray(res.body.data.ticketTypes)).toBe(true);
});

it('Unauthorized ticketsByDriver request fails (wrong driver)', async () => {
  const query = `
    query {
      ticketsByDriver(driverId: "another-driver") {
        id
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-driver-1')
    .send({ query })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0].message).toBe('Unauthorized');
});

it('Unauthorized user cannot pay ticket', async () => {
  const mutation = `
    mutation {
      payTicket(id: "${createdTicketId}") {
        id
        data {
          paid
        }
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer admin-token')
    .send({ query: mutation })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0].message).toBe('Unauthorized');
});

it('Unauthorized create ticket by driver fails', async () => {
  const mutation = `
    mutation {
      createTicket(data: {
        driverId: "some-driver-id",
        type: "6c95ad4e-0767-443e-b93a-5cbe4be39d6b"
      }) {
        id
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-driver-1')
    .send({ query: mutation })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0].message).toBe('Unauthorized');
});

it('Set violation price (admin only)', async () => {
  const mutation = `
    mutation {
      setViolationPrice(id: "6c95ad4e-0767-443e-b93a-5cbe4be39d6b", price: 150) {
        id
        price
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer admin-token')
    .send({ query: mutation })
    .expect(200);

  if (res.body.errors) console.error('Set Violation Price Errors:', res.body.errors);
  expect(res.body.data?.setViolationPrice).toBeDefined();
  expect(res.body.data.setViolationPrice.id).toBe('6c95ad4e-0767-443e-b93a-5cbe4be39d6b');
  expect(res.body.data.setViolationPrice.price).toBe(150);
});

it('Unauthorized set violation price fails (driver)', async () => {
  const mutation = `
    mutation {
      setViolationPrice(id: "6c95ad4e-0767-443e-b93a-5cbe4be39d6b", price: 150) {
        id
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-driver-1')
    .send({ query: mutation })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0].message).toBe('Unauthorized');
});

it('Unauthorized challenge ticket fails (admin)', async () => {
  const mutation = `
    mutation {
      challengeTicket(id: "${createdTicketId}", message: "Test challenge") {
        id
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer admin-token')
    .send({ query: mutation })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0].message).toBe('Unauthorized');
});

it('Unauthorized resolve challenge fails (driver)', async () => {
  const mutation = `
    mutation {
      resolveChallenge(id: "${createdTicketId}", accept: true) {
        id
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-driver-1')
    .send({ query: mutation })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0].message).toBe('Unauthorized');
});

it('Fails if no JWT provided', async () => {
  const mutation = `
    mutation {
      payTicket(id: "${createdTicketId}") {
        id
      }
    }
  `;
  const res = await supertest(server)
    .post('/graphql')
    .send({ query: mutation })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0].message).toBe('No JWT provided');
});
it('Driver gets own tickets (isSelf branch)', async () => {
  const query = `
    query {
      ticketsByDriver(driverId: "test-driver-1") {
        id
        data {
          driverId
          violation
        }
      }
    }
  `;

  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-driver-1')
    .send({ query })
    .expect(200);

  if (res.body.errors) console.error('Driver Self Ticket Query Errors:', res.body.errors);
  expect(res.body.data?.ticketsByDriver).toBeDefined();
  expect(Array.isArray(res.body.data.ticketsByDriver)).toBe(true);
});

it('TicketType schema instance works correctly', () => {
  const ticketType = new TicketType();
  ticketType.id = 'type-123';
  ticketType.price = 75;
  ticketType.violation = 'No Permit';

  expect(ticketType.id).toBe('type-123');
  expect(ticketType.price).toBe(75);
  expect(ticketType.violation).toBe('No Permit');
});