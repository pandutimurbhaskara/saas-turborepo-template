import {
  createSession,
  deleteSessionByTokenHash,
  findValidSessionByTokenHash,
  getUserWithAuthorization,
} from '@repo/db'
import {
  SESSION_DURATION_DAYS,
  type AuthenticatedSession,
  type Session,
  type User,
} from '@repo/types'
import { cache } from 'react'

import { clearSessionCookie, readSessionToken, setSessionCookie } from './cookies'
import { generateSessionToken, hashSessionToken } from './token'

const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000

export async function startSession(userId: string): Promise<Session> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  const session = await createSession({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  })

  await setSessionCookie(token, expiresAt)
  return session
}

export async function signOut(): Promise<void> {
  const token = await readSessionToken()
  if (token) {
    await deleteSessionByTokenHash(hashSessionToken(token))
  }
  await clearSessionCookie()
}

export const getSession = cache(async (): Promise<AuthenticatedSession | null> => {
  const token = await readSessionToken()
  if (!token) return null

  const session = await findValidSessionByTokenHash(hashSessionToken(token))
  if (!session) return null

  const user = await getUserWithAuthorization(session.userId)
  if (!user) return null

  return { user, session }
})

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}
