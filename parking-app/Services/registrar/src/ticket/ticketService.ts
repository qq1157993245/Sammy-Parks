import { Ticket } from '.'

interface TicketData {
  violation: string;
  overridden: boolean;
  paid: boolean;
  price: number;
  createdAt: string;
  challengeAccepted?: boolean;
}

interface TicketQueryResult {
  data: TicketData;
}

export class TicketService {
  public async checkTicket(
    id: string,
    accessToken?: string
  ): Promise<Ticket[] | undefined> {
    return new Promise((resolve, reject) => {
      fetch('http://localhost:5100/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || ''}`,
        },
        body: JSON.stringify({
          query: `query get($driverId: String!) {
            ticketsByDriver(driverId: $driverId) {
              data {
                violation,
                overridden,
                paid,
                price,
                createdAt,
                challengeAccepted,
              }
            }
          }`,
          variables: {
            driverId: id
          }
        }),
      })
        .then(response => {
          if (response.status != 200) {
            return resolve(undefined)
          }
          return response.json()
        })
        .then(r => {
          if (!r.data || !r.data.ticketsByDriver) {
            return resolve([])
          }

          const filtered = r.data.ticketsByDriver.filter(
            (ticket: TicketQueryResult) =>
              !ticket.data.overridden &&
              !ticket.data.paid &&
              !ticket.data.challengeAccepted
          )
          const result: Ticket[] = filtered.map((ticket: TicketQueryResult): Ticket => ({
            violation: ticket.data.violation,
            price: ticket.data.price,
            createdAt: ticket.data.createdAt,
          }))

          return resolve(result)
        })
        .catch(() => {
          return reject(new Error('Internal Server Error'))
        })
    })
  }
}