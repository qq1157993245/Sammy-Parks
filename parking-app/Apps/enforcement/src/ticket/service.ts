import 'server-only'
import { TicketType, TicketInput } from '.';

export class TicketService {
    public async listTypes (cookie: string | undefined): Promise<TicketType[]> {
      if (!cookie) {
        console.error('Missing auth token in listTypes');
        throw new Error('Unauthorized');
      }
      return new Promise((resolve, reject) => {
        fetch('http://localhost:5100/graphql',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cookie}`
            },
            body: JSON.stringify({
                query: `query TicketTypes {
                    ticketTypes {
                        id
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

    public async createTicket (cookie: string, licenseplate: string, violation: string) {
        let driverId = 'unknown';

        const vehicleResult = await fetch('http://localhost:5150/graphql',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cookie}`
            },
            body: JSON.stringify({
                query: `query GetVehicleByPlate($plate: String!) {
                    getVehicleByPlate(plate: $plate){
                        id
                        driverId
                        plate
                    }
                }`,
                variables: {
                    plate: licenseplate
                }
            }),
        });
        const response = await vehicleResult.json();
        if (response.data) {
            driverId = response.data.getVehicleByPlate.driverId;
        }

        const ticketResult = await fetch('http://localhost:5100/graphql',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cookie}`
            },
            body: JSON.stringify({
                query: `mutation CreateTicket($data: TicketInput!) {
                    createTicket(data: $data){
                        id
                    }
                }`,
                variables: {
                    data: {
                        driverId: driverId,
                        type: violation,
                    } as TicketInput
                }
            }),
        });
        const result = await ticketResult.json();
        return result;
    }
}
