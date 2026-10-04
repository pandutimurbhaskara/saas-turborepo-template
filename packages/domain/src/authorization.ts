import { WILDCARD_PERMISSION, type Permission, type Role } from '@repo/types'
import type { ApplicationDefinition } from '@repo/types'

export interface AuthorizedSubject {
  roles: readonly Role[]
  permissions: readonly Permission[]
}

export class AuthorizationError extends Error {
  readonly code = 'FORBIDDEN'

  constructor(message = 'You do not have permission to perform this action.') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

function normalizeRequirements<T>(required: T | T[]): T[] {
  return Array.isArray(required) ? required : [required]
}

export function hasRole(
  user: AuthorizedSubject | null | undefined,
  required: Role | Role[],
): boolean {
  if (!user) return false
  return normalizeRequirements(required).some((role) => user.roles.includes(role))
}

export function hasPermission(
  user: AuthorizedSubject | null | undefined,
  required: Permission | Permission[],
): boolean {
  if (!user) return false

  const granted = new Set<Permission>(user.permissions)
  if (granted.has(WILDCARD_PERMISSION)) return true

  return normalizeRequirements(required).some((permission) => granted.has(permission))
}

export function hasApplicationAccess(
  user: AuthorizedSubject | null | undefined,
  application: ApplicationDefinition,
): boolean {
  return hasRole(user, application.roles)
}

export function assertHasRole(
  user: AuthorizedSubject | null | undefined,
  required: Role | Role[],
  message?: string,
): void {
  if (!hasRole(user, required)) throw new AuthorizationError(message)
}

export function assertHasPermission(
  user: AuthorizedSubject | null | undefined,
  required: Permission | Permission[],
  message?: string,
): void {
  if (!hasPermission(user, required)) throw new AuthorizationError(message)
}

export function assertApplicationAccess(
  user: AuthorizedSubject | null | undefined,
  application: ApplicationDefinition,
  message?: string,
): void {
  if (!hasApplicationAccess(user, application)) throw new AuthorizationError(message)
}
