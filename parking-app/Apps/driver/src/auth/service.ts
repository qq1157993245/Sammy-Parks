import 'server-only'
import { Credentials, Authenticated } from './index'

export async function authenticate(credentials: Credentials): Promise<Authenticated|undefined> {
  const response = await fetch('http://localhost:5200/api/v0/driver-login', {
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
      if (!data.roles.includes('driver')) {
        reject('Unauthorized')
      } else resolve(data)
    })
    .catch(() => reject('Unauthorized'))
  })
}
export async function grabuuidfromoauth(id:string|undefined, email:string|undefined, name:string|undefined):Promise<string>{
  return new Promise((resolve,reject) => {
    fetch('http://localhost:5200/api/v0/oauth-driver-login',{
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id, email, name}),
    })
    .then(response =>{
      if (response.status !== 200){
        reject("Unexpected Error")
        return;
      }
      return response.json()
    })
    .then(data => resolve(data))
    .catch(() => reject('Unauthorized'))

  })
}

export async function createNewAccount(credentials: Credentials): Promise<Authenticated|undefined> {
  const response = await fetch('http://localhost:5200/api/v0/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: credentials.name,
      email: credentials.email,
      password: credentials.password
    }),
  })

  const data = await response.json();
  if (response.status !== 200) {
    return undefined
  }
  return data;
}
