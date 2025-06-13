import { NewVehicle, Vehicle } from ".";

export async function list(cookie: string | undefined): Promise<Vehicle[]> {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:5150/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cookie}`,
      },
      body: JSON.stringify({ query: '{vehicle {id, plate, state}}' }),
    })
      .then(response => {
        return response.json()
      }
      )
      .then(json => {
        if (json.errors) {
          reject('Unauthorized')
        }
        resolve(json.data.vehicle)
      })
      .catch(() => reject('Unauthorized'))
  })
}

export async function add(cookie: string | undefined, vehicle: NewVehicle): Promise<Vehicle> {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:5150/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cookie}`,
      },
      body: JSON.stringify({
        query: `mutation {
            addVehicle(vehicle: {
              plate: "${vehicle.plate}"
              state: "${vehicle.state}"
            }) {
              id, plate, state
            }
          }`
      }),
    })
      .then(response => {
        return response.json()
      }
      )
      .then(json => {
        if (json.errors) {
          reject('Unauthorized')
        }
        resolve(json.data.vehicle)
      })
      .catch(() => reject('Unauthorized'))
  })
}
