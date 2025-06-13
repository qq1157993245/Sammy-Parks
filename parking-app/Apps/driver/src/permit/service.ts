import { Permit, PermitType, PermitZone } from "./index";

export class PermitService {
  public async listTypes(cookie: string | undefined): Promise<PermitType[]> {
    if (!cookie) {
      console.error('Missing auth token in listTypes');
      throw new Error('Unauthorized');
    }
    return new Promise((resolve, reject) => {
      fetch('http://localhost:5050/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`,
        },
        body: JSON.stringify({query: '{getPermitTypes {id, type, day_duration, month_duration, price}}'}),
      }).then(response => {
          return response.json()
      })
      .then(json => {
        if (json.errors) {
          console.error('GraphQL Errors in listTypes:', json.errors);
          return reject(json.errors);
        }
        resolve(json.data.getPermitTypes);
      })
      .catch(err => {
        console.error('Network or parsing error in listTypes:', err);
        reject(err);
      });
    })
  }

  public async list(cookie: string | undefined): Promise<Permit[]> {
    return new Promise((resolve, reject) => {
      fetch('http://localhost:5050/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`,
        },
        body: JSON.stringify({ query: '{getPermitsByDriver {id, vehicleId, startTime, endTime, plate, zone}}' }),
      }).then(response => {
        return response.json()
      })
      .then(json => {
        if (json.errors) {
          console.error('GraphQL Errors in list:', json.errors);
          return reject(json.errors);
        }
        resolve(json.data.getPermitsByDriver);
      })
      .catch(err => {
        console.error('Network or parsing error in list:', err);
        reject(err);
      });
    })
  }

  public async listZones(cookie: string | undefined): Promise<PermitZone[]> {
    return new Promise((resolve, reject) => {
      fetch('http://localhost:5050/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`,
        },
        body: JSON.stringify({ query: '{getZoneTypes {id, zone, maxPermits}}' })
      }).then(response => {
        return response.json()
      }).then(json => {
        if (json.errors) {
          reject('Unauthorized')
        }
        resolve(json.data.getZoneTypes)
      }).catch(() => reject('Unauthorized'))
    })
  }

  public async getPermitCountInZone(cookie: string | undefined, zone: string): Promise<number> {
    if (!cookie) {
      console.error('Missing auth token in getPermitCountInZone');
      throw new Error('Unauthorized');
    }

    return new Promise((resolve, reject) => {
      fetch('http://localhost:5050/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`,
        },
        body: JSON.stringify({
          query: `
            query GetPermitCountInZone($zone: String!) {
              getPermitCountInZone(zone: $zone)
            }
          `,
          variables: { zone }
        }),
      })
        .then(response => response.json())
        .then(json => {
          if (json.errors) {
            console.error('GraphQL Errors in getPermitCountInZone:', json.errors);
            return reject(json.errors);
          }
          resolve(json.data.getPermitCountInZone);
        })
        .catch(err => {
          console.error('Network or parsing error in getPermitCountInZone:', err);
          reject(err);
        });
    });
  }

  public async add(cookie: string | undefined, permitTypeId: string, zoneId: string, vehicleId: string): Promise<Permit> {
    return new Promise((resolve, reject) => {
      fetch('http://localhost:5050/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`,
        },
        body: JSON.stringify({
          query: `
            mutation BuyPermit($permitTypeId: String!, $vehicleId: String!, $zoneId: String!) {
              buyPermit(permitTypeId: $permitTypeId, vehicleId: $vehicleId, zoneTypeId: $zoneId) {
                id
                vehicleId
                startTime
                endTime
              }
            }
          `,
          variables: {
            permitTypeId,
            vehicleId,
            zoneId
          }
        }),
      })
        .then(response => response.json())
        .then(json => {
          if (json.errors) {
            console.error('GraphQL Errors in add:', json.errors);
            return reject(json.errors);
          }
          resolve(json.data.buyPermit);
        })
        .catch(err => {
          console.error('Network or parsing error in add:', err);
          reject(err);
        });
    })
  }
}
