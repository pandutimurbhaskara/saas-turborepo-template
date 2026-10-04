import type { Permission, Role } from './authorization'

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  roles: Role[]
  permissions: Permission[]
  createdAt: Date
}

export interface UserPreferences {
  productUpdates: boolean
  weeklyDigest: boolean
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  productUpdates: true,
  weeklyDigest: false,
}
