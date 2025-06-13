import { cookies } from 'next/headers';
import { TicketType } from '../components/admin/types';

const TICKET_API_URL = 'http://localhost:5100/graphql';

export async function getAllTickets() {
  const query = `
    query {
      tickets {
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
      ...(cookie ? { Authorization: `Bearer ${cookie}` } : {})
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error('Failed to fetch tickets from Ticket Microservice');
  }

  return result.data.tickets;
}

export async function overrideTicket(id: string) {
  const query = `
    mutation {
      overrideTicket(id: "${id}") {
        id
        data {
          overridden
        }
      }
    }
  `;

  const cookie = (await cookies()).get('session')?.value;

  const response = await fetch(TICKET_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Authorization: `Bearer ${cookie}` } : {})
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL override error:', result.errors);
    throw new Error('Override ticket failed');
  }

  return result.data.overrideTicket;
}

export async function resolveChallenge(id: string, accept: boolean) {
  const query = `
    mutation ResolveChallenge($id: String!, $accept: Boolean!) {
      resolveChallenge(id: $id, accept: $accept) {
        id
        data {
          challenged
          overridden
        }
      }
    }
  `;

  const cookie = (await cookies()).get('session')?.value;

  const response = await fetch(TICKET_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Authorization: `Bearer ${cookie}` } : {})
    },
    body: JSON.stringify({
      query,
      variables: { id, accept },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL resolveChallenge error:', result.errors);
    throw new Error('Failed to resolve ticket challenge');
  }

  return result.data.resolveChallenge;
}
    
export async function listTypes (): Promise<TicketType[]> {
  const cookie = (await cookies()).get('session')?.value;

  return new Promise((resolve, reject) => {
    fetch(TICKET_API_URL, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`
      },
      body: JSON.stringify({
          query: `query TicketTypes {
              ticketTypes {
                  id
                  price
                  violation
              }
          }`,
      }),
    }).then(response => {
      return response.json()
    })
    .then(json => {
      if (json.errors) {
        console.error('GraphQL Errors in listTypes:', json.errors);
        return reject(json.errors);
      }
      resolve(json.data.ticketTypes);
    })
    .catch(err => {
      console.error('Network or parsing error in listTypes:', err);
      reject(err);
    });
  })
}

export async function setPrice (id: string, price: number): Promise<TicketType> {
  const cookie = (await cookies()).get('session')?.value;

  return new Promise((resolve, reject) => {
    fetch(TICKET_API_URL, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`
      },
      body: JSON.stringify({
          query: `mutation SetViolationPrice($id: String!, $price: Int!) {
                    setViolationPrice(id: $id, price: $price) {
                      id
                      price
                      violation
                    }
          }`,
          variables: { id, price },
      }),
    }).then(response => {
      return response.json()
    })
    .then(json => {
      if (json.errors) {
        console.error('GraphQL Errors in listTypes:', json.errors);
        return reject(json.errors);
      }
      resolve(json.data.setViolationPrice);
    })
    .catch(err => {
      console.error('Network or parsing error in listTypes:', err);
      reject(err);
    });
  })
}
