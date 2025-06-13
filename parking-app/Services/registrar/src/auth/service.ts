import { Member } from "."

export async function check(key: string | undefined): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:5200/api/v0/check-registrar-key?key=${key}`, {
      method: 'GET',
    })
      .then(response => {
        if (response.status != 200) {
          return reject(new Error('Unauthorized'))
        }
        return response.json()
      })
      .then(r => {
        return resolve(r)
      })
      .catch(() => reject(new Error('Unauthorized')))
  })
}

export async function getIdByEmail(email: string): Promise<Member|undefined> {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:5200/api/v0/get-id-by-email?email=${email}`, {
      method: 'GET',
    })
      .then(response => {
        if (response.status != 200) {
          return resolve(undefined)
        }
        return response.json()
      })
      .then(r => {
        return resolve(r)
      })
      .catch(() => {
        return reject(undefined)
      })
  })
}
