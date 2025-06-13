
export async function check(cookie: string|undefined): Promise<{id: string, roles: string}> {
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
    .then(data => resolve(data))
    .catch(() => reject('Unauthorized'))
  })
}
