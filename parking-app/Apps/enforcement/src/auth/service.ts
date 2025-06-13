import 'server-only'
import { Credentials, Authenticated } from './index'
import { cookies } from 'next/headers'

export async function authenticate(credentials: Credentials): Promise<Authenticated|undefined> {
  const response = await fetch('http://localhost:5200/api/v0/enforcement-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
  });

  if (response.status !== 200) {
    return undefined;
  }

  const data = await response.json();
  return data;
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
      return response.json()
    })
    .then((data) => {
      if (!data.roles.includes('enforcement')) {
        reject('Unauthorized')
      } else resolve(data)
    })
    .catch(() => reject('Unauthorized'))
  })
}

export async function extractCookie(): Promise<string|undefined> {
  const cookie = (await cookies()).get('session')?.value;
  return cookie;
}
