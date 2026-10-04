import { createHmac, randomBytes } from 'node:crypto'

import { getAuthEnv } from './env'

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashSessionToken(token: string, secret?: string): string {
  const key = secret ?? getAuthEnv().AUTH_SECRET
  return createHmac('sha256', key).update(token).digest('hex')
}
