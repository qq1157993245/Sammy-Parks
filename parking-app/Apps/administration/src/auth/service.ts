
import 'server-only'
import { Credentials, Authenticated } from './index'


export async function authenticate(credentials: Credentials): Promise<Authenticated|undefined> {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:5200/api/v0/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    .then(response => { 
      if (response.status != 200) {
        reject('Unauthorized')
      }
      return response.json()} 
    )
    .then(data => resolve(data))
    .catch(() => reject('Unauthorized'))
  })
}

export async function check(cookie: string|undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:5200/api/v0/check', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cookie}`,
      }
    })
    .then(response => { 
      if (response.status != 200) {
        reject('Unauthorized')
      }
      return response.json()} 
    )
    .then((data) => {
      if (!data.roles.includes('admin')) {
        reject('Unauthorized')
      } else resolve(data)
    })
    .catch(() => reject('Unauthorized'))
  })
}
