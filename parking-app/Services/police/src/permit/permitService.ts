import { Permit } from '.'

export class PermitService {
  public async checkPermit(
    vehiclePlate: string
  ): Promise<Permit | undefined> {
    return new Promise((resolve, reject) => {
      fetch('http://localhost:5050/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query {
            policeGetPermit(plate: "${vehiclePlate}") {
              startTime
              endTime
              plate
              zone
              vehicleId
            }
          }`}),
      })
        .then(response => {
          return response.json()
        })
        .then(r => {
          if (r.errors) {
            return reject(undefined)
          }
          resolve(r.data.policeGetPermit)
        })
        .catch(() => {
          reject(undefined)
        })
    })
  }
}