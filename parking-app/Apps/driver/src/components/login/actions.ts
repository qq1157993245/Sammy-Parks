'use server'

import { cookies } from 'next/headers'

import { Credentials, Authenticated } from '../../auth'
import { authenticate } from '../../auth/service'

export async function login(credentials: Credentials) : Promise<Authenticated|undefined> {
  const user = await authenticate(credentials)
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
    return { name: user.name, accessToken: user.accessToken }
  }
  return undefined
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
} 
 
/* export async function logout() {
  const cookieStore = await cookies();
  
  // Get all cookies and delete them
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    cookieStore.delete(cookie.name);
  }
} */