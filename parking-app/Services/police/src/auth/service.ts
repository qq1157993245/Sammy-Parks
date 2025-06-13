export async function check(key: string | undefined): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:5200/api/v0/check-police-key?key=${key}`, {
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
