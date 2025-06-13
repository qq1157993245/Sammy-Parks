'use server'

import { cookies } from 'next/headers'

import { Credentials, Authenticated } from '../../auth'
import { authenticate } from '../../auth/service'

export async function login(credentials: Credentials) : Promise<Authenticated|undefined> {
  const user = await authenticate(credentials)
  console.log('Authentication result:', user);
  if (user) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    const session = user.accessToken
    const cookieStore = await cookies()
   
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })
    console.log('Login successful. Setting session cookie:', session);
    return { name: user.name, accessToken: user.accessToken }
  }
  return undefined
}

export async function logout() {
  console.log('Executing logout. Deleting session cookie.');
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
