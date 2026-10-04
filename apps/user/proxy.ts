import { getApplicationByKey, getApplicationFromHost } from '@repo/domain'
import { joinUrl } from '@repo/utils'
import { NextResponse, type NextRequest } from 'next/server'

import { APPLICATION_KEY } from '@/lib/app'

export function proxy(request: NextRequest) {
  const resolved = getApplicationFromHost(request.headers.get('host'))
  const self = getApplicationByKey(APPLICATION_KEY)

  if (resolved && resolved.key !== APPLICATION_KEY && self) {
    const target = joinUrl(resolved.url, `${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(target)
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
