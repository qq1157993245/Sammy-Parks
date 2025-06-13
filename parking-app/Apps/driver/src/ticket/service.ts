import { cookies } from 'next/headers';

const TICKET_API_URL = 'http://localhost:5100/graphql';

export async function getTicketsForDriver(driverId: string) {
  const query = `
    query TicketsByDriver($driverId: String!) {
      ticketsByDriver(driverId: $driverId) {
        id
        data {
          driverId
          violation
          overridden
          paid
          price
          issuedBy
          createdAt
          challenged
          challengeMessage
          challengeDenied
          challengeAccepted
        }
      }
    }
  `;

  const cookie = (await cookies()).get('session')?.value;

  const response = await fetch(TICKET_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cookie}`,
    },
    body: JSON.stringify({
      query,
      variables: { driverId },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error('Failed to fetch tickets from Ticket Microservice');
  }

  return result.data.ticketsByDriver;
}

export async function markTicketAsPaid(ticketId: string): Promise<void> {
  const query = `
    mutation {
      payTicket(id: "${ticketId}") {
        id
        data {
          paid
          challengeDenied
          challengeAccepted
        }
      }
    }
  `;

  const cookie = (await cookies()).get('session')?.value;

  const response = await fetch(TICKET_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cookie}`,
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL payTicket error:', result.errors);
    throw new Error('Mark ticket as paid failed');
  }
}

export async function challengeTicket(ticketId: string, message: string): Promise<void> {
  const query = `
    mutation {
      challengeTicket(id: "${ticketId}", message: "${message}") {
        id
        data {
          challenged
          challengeMessage
          challengeDenied
          challengeAccepted
        }
      }
    }
  `;

  const cookie = (await cookies()).get('session')?.value;

  const response = await fetch(TICKET_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cookie}`,
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL challengeTicket error:', result.errors);
    throw new Error('Challenging ticket failed');
  }
}
