import 'server-only'

export { signIn, signUp } from './credentials'
export { getAuthEnv } from './env'
export { AuthError, EmailTakenError, InvalidCredentialsError } from './errors'
export { requireApplicationAccess, requireAuth, requirePermission, requireRole } from './guards'
export { getCurrentUser, getSession, signOut } from './session'

export { AuthorizationError, hasApplicationAccess, hasPermission, hasRole } from '@repo/domain'
