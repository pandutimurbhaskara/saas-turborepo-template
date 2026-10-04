import {
  APPLICATION_KEYS,
  APPLICATION_ROLES,
  type ApplicationDefinition,
  type ApplicationKey,
  type ApplicationRegistry,
} from '@repo/types'
import { joinUrl, stripTrailingSlash } from '@repo/utils'

import { getApplicationEnv } from './env'
import { getSubdomain, parseHost } from './host'

export const RESERVED_SUBDOMAINS = ['www', 'app', 'api', 'admin', 'seller', 'staff'] as const

export type ReservedSubdomain = (typeof RESERVED_SUBDOMAINS)[number]

export function isReservedSubdomain(subdomain: string | null | undefined): boolean {
  if (!subdomain) return false
  return (RESERVED_SUBDOMAINS as readonly string[]).includes(subdomain)
}

export interface ApplicationConfigInput {
  domain: string
  applications: Partial<Record<ApplicationKey, { url: string } | undefined>>
}

export function buildApplicationRegistry(config: ApplicationConfigInput): ApplicationRegistry {
  const base = parseHost(config.domain)
  if (!base) {
    throw new Error(`Invalid application domain: "${config.domain}"`)
  }

  const applications: ApplicationDefinition[] = []

  for (const key of Object.values(APPLICATION_KEYS)) {
    const entry = config.applications[key]
    if (!entry?.url) continue

    const url = stripTrailingSlash(entry.url)
    const parsedUrl = parseHost(url)
    if (!parsedUrl) {
      throw new Error(`Invalid URL configured for application "${key}": "${entry.url}"`)
    }

    applications.push({
      key,
      host: parsedUrl.hostname,
      url,
      roles: APPLICATION_ROLES[key],
      enabled: true,
      subdomain: getSubdomain(parsedUrl.hostname, base.hostname),
    })
  }

  return { domain: base.hostname, applications }
}

let cachedRegistry: ApplicationRegistry | null = null

export function getApplicationRegistry(): ApplicationRegistry {
  if (cachedRegistry) return cachedRegistry

  const env = getApplicationEnv()

  cachedRegistry = buildApplicationRegistry({
    domain: env.APP_DOMAIN,
    applications: {
      user: { url: env.USER_APP_URL },
      admin: { url: env.ADMIN_APP_URL },
      seller: env.SELLER_APP_URL ? { url: env.SELLER_APP_URL } : undefined,
    },
  })

  return cachedRegistry
}

export function resetApplicationRegistry(): void {
  cachedRegistry = null
}

export function getApplicationFromHost(
  host: string | null | undefined,
  registry: ApplicationRegistry = getApplicationRegistry(),
): ApplicationDefinition | null {
  const parsed = parseHost(host)
  if (!parsed) return null

  return registry.applications.find((application) => application.host === parsed.hostname) ?? null
}

export function getApplicationByKey(
  key: ApplicationKey,
  registry: ApplicationRegistry = getApplicationRegistry(),
): ApplicationDefinition | null {
  return registry.applications.find((application) => application.key === key) ?? null
}

export function getApplicationUrl(
  key: ApplicationKey,
  path = '/',
  registry: ApplicationRegistry = getApplicationRegistry(),
): string | null {
  const application = getApplicationByKey(key, registry)
  return application ? joinUrl(application.url, path) : null
}

export interface HostResolution {
  application: ApplicationDefinition | null
  hostname: string
  port: string | null
  subdomain: string | null
  isReservedSubdomain: boolean
}

export function resolveHost(
  host: string | null | undefined,
  registry: ApplicationRegistry = getApplicationRegistry(),
): HostResolution | null {
  const parsed = parseHost(host)
  if (!parsed) return null

  const subdomain = getSubdomain(parsed.hostname, registry.domain)

  return {
    application: getApplicationFromHost(parsed.hostname, registry),
    hostname: parsed.hostname,
    port: parsed.port,
    subdomain,
    isReservedSubdomain: isReservedSubdomain(subdomain),
  }
}
