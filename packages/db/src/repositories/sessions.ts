import type { Session } from '@repo/types'
import { and, eq, gt, lt } from 'drizzle-orm'

import { getDb } from '../client'
import { sessions } from '../schema'

const sessionColumns = {
  id: sessions.id,
  userId: sessions.userId,
  expiresAt: sessions.expiresAt,
  createdAt: sessions.createdAt,
}

export interface CreateSessionInput {
  userId: string
  tokenHash: string
  expiresAt: Date
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  const [row] = await getDb().insert(sessions).values(input).returning(sessionColumns)

  if (!row) throw new Error('Failed to create session')
  return row
}

export async function findValidSessionByTokenHash(tokenHash: string): Promise<Session | null> {
  const [row] = await getDb()
    .select(sessionColumns)
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1)

  return row ?? null
}

export async function extendSession(sessionId: string, expiresAt: Date): Promise<void> {
  await getDb().update(sessions).set({ expiresAt }).where(eq(sessions.id, sessionId))
}

export async function deleteSessionByTokenHash(tokenHash: string): Promise<void> {
  await getDb().delete(sessions).where(eq(sessions.tokenHash, tokenHash))
}

export async function deleteExpiredSessions(): Promise<number> {
  const rows = await getDb()
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date()))
    .returning({ id: sessions.id })

  return rows.length
}
