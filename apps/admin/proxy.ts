import { getApplicationByKey, getApplicationFromHost } from '@repo/domain'
import { SESSION_COOKIE_NAME } from '@repo/types'
import { joinUrl } from '@repo/utils'
import { NextResponse, type NextRequest } from 'next/server'

import { APPLICATION_KEY } from '@/lib/app'

const PROTECTED_PREFIXES = ['/dashboard', '/users', '/settings']

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const resolved = getApplicationFromHost(request.headers.get('host'))
  const self = getApplicationByKey(APPLICATION_KEY)

  if (resolved && resolved.key !== APPLICATION_KEY && self) {
    return NextResponse.redirect(joinUrl(resolved.url, `${pathname}${search}`))
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (isProtected && !request.cookies.get(SESSION_COOKIE_NAME)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-application-key', APPLICATION_KEY)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
