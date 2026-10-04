import { PERMISSIONS, ROLE_PERMISSIONS, ROLES, type Permission, type Role } from '@repo/types'
import { describe, expect, it } from 'vitest'

import { buildApplicationRegistry, getApplicationByKey } from './applications'
import {
  assertApplicationAccess,
  assertHasPermission,
  assertHasRole,
  AuthorizationError,
  hasApplicationAccess,
  hasPermission,
  hasRole,
  type AuthorizedSubject,
} from './authorization'

function subject(roles: Role[], permissions: Permission[] = []): AuthorizedSubject {
  return { roles, permissions }
}

const registry = buildApplicationRegistry({
  domain: 'example.com',
  applications: {
    user: { url: 'https://example.com' },
    admin: { url: 'https://admin.example.com' },
  },
})

describe('hasRole', () => {
  it('matches a single required role', () => {
    expect(hasRole(subject([ROLES.USER]), ROLES.USER)).toBe(true)
    expect(hasRole(subject([ROLES.USER]), ROLES.ADMIN)).toBe(false)
  })

  it('matches any of several required roles', () => {
    expect(hasRole(subject([ROLES.SELLER]), [ROLES.ADMIN, ROLES.SELLER])).toBe(true)
    expect(hasRole(subject([ROLES.USER]), [ROLES.ADMIN, ROLES.SELLER])).toBe(false)
  })

  it('supports users with multiple roles', () => {
    const user = subject([ROLES.USER, ROLES.ADMIN])
    expect(hasRole(user, ROLES.USER)).toBe(true)
    expect(hasRole(user, ROLES.ADMIN)).toBe(true)
  })

  it('returns false for missing users', () => {
    expect(hasRole(null, ROLES.USER)).toBe(false)
    expect(hasRole(undefined, ROLES.USER)).toBe(false)
  })
})

describe('hasPermission', () => {
  it('checks explicit grants', () => {
    const user = subject([ROLES.USER], [PERMISSIONS.USERS_READ])
    expect(hasPermission(user, PERMISSIONS.USERS_READ)).toBe(true)
    expect(hasPermission(user, PERMISSIONS.USERS_MANAGE)).toBe(false)
  })

  it('supports wildcard grants', () => {
    const admin = subject([ROLES.ADMIN], ROLE_PERMISSIONS[ROLES.ADMIN])
    expect(hasPermission(admin, PERMISSIONS.USERS_MANAGE)).toBe(true)
    expect(hasPermission(admin, PERMISSIONS.SETTINGS_MANAGE)).toBe(true)
  })

  it('accepts a list of requirements', () => {
    const user = subject([ROLES.USER], [PERMISSIONS.USERS_READ])
    expect(hasPermission(user, [PERMISSIONS.USERS_MANAGE, PERMISSIONS.USERS_READ])).toBe(true)
    expect(hasPermission(user, [PERMISSIONS.USERS_MANAGE, PERMISSIONS.ADMIN_ACCESS])).toBe(false)
  })

  it('returns false for users without permissions', () => {
    expect(hasPermission(subject([ROLES.USER]), PERMISSIONS.DASHBOARD_VIEW)).toBe(false)
    expect(hasPermission(null, PERMISSIONS.DASHBOARD_VIEW)).toBe(false)
  })
})

describe('application access', () => {
  it('allows roles listed on the application definition', () => {
    const user = subject([ROLES.USER])
    expect(hasApplicationAccess(user, getApplicationByKey('user', registry)!)).toBe(true)
    expect(hasApplicationAccess(user, getApplicationByKey('admin', registry)!)).toBe(false)
  })

  it('allows admins into both applications', () => {
    const admin = subject([ROLES.ADMIN])
    expect(hasApplicationAccess(admin, getApplicationByKey('user', registry)!)).toBe(true)
    expect(hasApplicationAccess(admin, getApplicationByKey('admin', registry)!)).toBe(true)
  })

  it('rejects unauthenticated users', () => {
    expect(hasApplicationAccess(null, getApplicationByKey('admin', registry)!)).toBe(false)
  })
})

describe('assert helpers', () => {
  it('throw AuthorizationError when checks fail', () => {
    expect(() => assertHasRole(subject([ROLES.USER]), ROLES.ADMIN)).toThrow(AuthorizationError)
    expect(() => assertHasPermission(subject([ROLES.USER]), PERMISSIONS.USERS_MANAGE)).toThrow(
      AuthorizationError,
    )
    expect(() =>
      assertApplicationAccess(subject([ROLES.USER]), getApplicationByKey('admin', registry)!),
    ).toThrow(AuthorizationError)
  })

  it('pass when checks succeed', () => {
    const admin = subject([ROLES.ADMIN], ROLE_PERMISSIONS[ROLES.ADMIN])
    expect(() => assertHasRole(admin, ROLES.ADMIN)).not.toThrow()
    expect(() => assertHasPermission(admin, PERMISSIONS.USERS_MANAGE)).not.toThrow()
    expect(() =>
      assertApplicationAccess(admin, getApplicationByKey('admin', registry)!),
    ).not.toThrow()
  })
})
