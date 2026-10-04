export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  STAFF: 'STAFF',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const WILDCARD_PERMISSION = '*' as const

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  PROFILE_UPDATE: 'profile:update',
  SETTINGS_READ: 'settings:read',
  SETTINGS_MANAGE: 'settings:manage',
  USERS_READ: 'users:read',
  USERS_MANAGE: 'users:manage',
  ADMIN_ACCESS: 'admin:access',
  SELLER_ACCESS: 'seller:access',
  STAFF_ACCESS: 'staff:access',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type Permission = PermissionKey | typeof WILDCARD_PERMISSION

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.USER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_MANAGE,
  ],
  [ROLES.ADMIN]: [WILDCARD_PERMISSION],
  [ROLES.SELLER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SELLER_ACCESS,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.STAFF_ACCESS,
  ],
}
