import { SESSION_COOKIE_NAME } from '@repo/types'
import { cookies } from 'next/headers'

import { getAuthEnv } from './env'

function baseCookieOptions() {
  const env = getAuthEnv()
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(env.AUTH_COOKIE_DOMAIN ? { domain: env.AUTH_COOKIE_DOMAIN } : {}),
  }
}

export async function readSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    expires: expiresAt,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    ...baseCookieOptions(),
    expires: new Date(0),
  })
}
