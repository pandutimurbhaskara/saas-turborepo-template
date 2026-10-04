import type { Role } from './authorization'
import { ROLES } from './authorization'

export const APPLICATION_KEYS = {
  USER: 'user',
  ADMIN: 'admin',
  SELLER: 'seller',
} as const

export type ApplicationKey = (typeof APPLICATION_KEYS)[keyof typeof APPLICATION_KEYS]

export interface ApplicationDefinition {
  key: ApplicationKey
  host: string
  url: string
  roles: Role[]
  enabled: boolean
  subdomain: string | null
}

export const APPLICATION_ROLES: Record<ApplicationKey, Role[]> = {
  [APPLICATION_KEYS.USER]: [ROLES.USER, ROLES.ADMIN, ROLES.SELLER],
  [APPLICATION_KEYS.ADMIN]: [ROLES.ADMIN],
  [APPLICATION_KEYS.SELLER]: [ROLES.SELLER],
}

export interface ApplicationRegistry {
  domain: string
  applications: ApplicationDefinition[]
}
