import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import createMiddleware from 'next-intl/middleware'
import {getToken} from 'next-auth/jwt'
import { check } from './auth/service'
import { routing } from './i18n/routing'

const publicRoutes = [
  '/driver/login', 
  '/driver/es/login',
  '/driver/signup',
  '/driver/es/signup', 
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/auth/signin/google',
  '/api/auth/callback/google',
  '/driver/api/auth/signin',
  '/driver/api/auth/callback',
  '/driver/api/auth/signin/google',
  '/driver/api/auth/callback/google',
]
const i18nMiddleware = createMiddleware(routing)

export default async function middleware(req: NextRequest) {
  if (!publicRoutes.includes(req.nextUrl.basePath + req.nextUrl.pathname)) {
    //console.log('not public route ' +  req.nextUrl.basePath + req.nextUrl.pathname)
    try {
      const cookieStore = cookies();                // <— no await needed

      const cookie = (await cookieStore).get('session')?.value
      
      const token  = cookie ? null : await getToken({ req, raw: true });
      /* const signedToken = jwt.sign({id: token?.id, roles: "driver"},
        `${process.env.MASTER_SECRET}`,{
          expiresIn: '30m',
          algorithm: 'HS256'
        }
      ) */

      if (cookie) {
        await check(cookie);
      }
      else if (token) {
        await check(token);     
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
        const session = token
        const cookieStore = await cookies()
      
        cookieStore.set('session', session, {
          httpOnly: true,
          secure: true,
          expires: expiresAt,
          sameSite: 'lax',
          path: '/',
        })
      }
      else {
        throw new Error('No authentication')
      }
    } catch {
      //console.log('redirect to ' + new URL('/driver/login', req.nextUrl).pathname)
      return NextResponse.redirect(new URL('/driver/login', req.nextUrl))
    }
  }
  return i18nMiddleware(req)
}

export const config = {
  matcher: [
    '/', '/(en|es)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    '/driver/:path*'              // ← NEW, catches everything behind the basePath
  ],
};
