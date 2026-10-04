import type { User } from './user'

export const SESSION_COOKIE_NAME = 'app_session'

export const SESSION_DURATION_DAYS = 30

export interface Session {
  id: string
  userId: string
  expiresAt: Date
  createdAt: Date
}

export interface AuthenticatedSession {
  user: User
  session: Session
}
