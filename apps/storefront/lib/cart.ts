import 'server-only'

import { getCurrentUser } from '@repo/auth'
import { getCartBySession, getCartByUser, type CartRecord } from '@repo/db'
import { CART_COOKIE_NAME } from '@repo/types'
import { cookies } from 'next/headers'
import { randomUUID } from 'node:crypto'

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export async function getCartSessionId(): Promise<string | null> {
  const store = await cookies()
  return store.get(CART_COOKIE_NAME)?.value ?? null
}

export async function ensureCartSessionId(): Promise<string> {
  const store = await cookies()
  const existing = store.get(CART_COOKIE_NAME)?.value
  if (existing) return existing

  const sessionId = randomUUID()
  store.set(CART_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CART_COOKIE_MAX_AGE,
  })

  return sessionId
}

export async function clearCartSessionId(): Promise<void> {
  const store = await cookies()
  store.delete(CART_COOKIE_NAME)
}

export async function getCurrentCart(): Promise<CartRecord | null> {
  const user = await getCurrentUser()
  if (user) return getCartByUser(user.id)

  const sessionId = await getCartSessionId()
  if (!sessionId) return null

  return getCartBySession(sessionId)
}
