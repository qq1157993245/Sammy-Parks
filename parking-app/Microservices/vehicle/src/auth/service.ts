
export async function check(cookie: string|undefined): Promise<string> {
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
    .then(data => resolve(data.id))
    .catch(() => reject('Unauthorized'))
  })
}
