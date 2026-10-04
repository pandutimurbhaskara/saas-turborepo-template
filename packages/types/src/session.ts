import type { User } from './user'

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
