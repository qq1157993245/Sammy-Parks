import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import createMiddleware from 'next-intl/middleware'

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
    try {
      const cookie = (await cookies()).get('session')?.value
      await check(cookie)
    } catch {
      return NextResponse.redirect(new URL('/driver/login', req.nextUrl));
    }
  }
  return i18nMiddleware(req);
}

export const config = {
  matcher: [
    '/', '/(en|es)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    '/driver/:path*'              // ← NEW, catches everything behind the basePath
  ],
};