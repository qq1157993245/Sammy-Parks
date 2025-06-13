'use server'

import { cookies } from 'next/headers'
import { Credentials, Authenticated } from '../../auth'
import { createNewAccount } from '../../auth/service'

export async function signup(credentials: Credentials) : Promise<Authenticated|undefined> {
  const user = await createNewAccount(credentials)
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