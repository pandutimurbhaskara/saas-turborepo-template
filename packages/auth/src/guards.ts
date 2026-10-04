import { getApplicationByKey, hasApplicationAccess, hasPermission, hasRole } from '@repo/domain'
import type { ApplicationKey, Permission, Role, User } from '@repo/types'
import { redirect } from 'next/navigation'

import { getCurrentUser } from './session'

export interface AuthGuardOptions {
  loginPath?: string
  forbiddenPath?: string
}

const DEFAULT_LOGIN_PATH = '/login'
const DEFAULT_FORBIDDEN_PATH = '/forbidden'

export async function requireAuth(options: AuthGuardOptions = {}): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect(options.loginPath ?? DEFAULT_LOGIN_PATH)
  return user
}

export async function requireRole(
  roles: Role | Role[],
  options: AuthGuardOptions = {},
): Promise<User> {
  const { loginPath = DEFAULT_LOGIN_PATH, forbiddenPath = DEFAULT_FORBIDDEN_PATH } = options

  const user = await getCurrentUser()
  if (!user) redirect(loginPath)
  if (!hasRole(user, roles)) redirect(forbiddenPath)

  return user
}

export async function requirePermission(
  permissions: Permission | Permission[],
  options: AuthGuardOptions = {},
): Promise<User> {
  const { loginPath = DEFAULT_LOGIN_PATH, forbiddenPath = DEFAULT_FORBIDDEN_PATH } = options

  const user = await getCurrentUser()
  if (!user) redirect(loginPath)
  if (!hasPermission(user, permissions)) redirect(forbiddenPath)

  return user
}

export async function requireApplicationAccess(
  applicationKey: ApplicationKey,
  options: AuthGuardOptions = {},
): Promise<User> {
  const { loginPath = DEFAULT_LOGIN_PATH, forbiddenPath = DEFAULT_FORBIDDEN_PATH } = options

  const user = await getCurrentUser()
  if (!user) redirect(loginPath)

  const application = getApplicationByKey(applicationKey)
  if (!application) {
    throw new Error(`Application "${applicationKey}" is not configured in this deployment.`)
  }

  if (!hasApplicationAccess(user, application)) redirect(forbiddenPath)

  return user
}
