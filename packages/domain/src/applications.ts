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

export const RESERVED_SUBDOMAINS = ['www', 'app', 'api', 'admin', 'store', 'shop'] as const

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
      storefront: { url: env.STORE_APP_URL },
      admin: { url: env.ADMIN_APP_URL },
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

const LOOPBACK_HOSTNAMES = ['localhost', '127.0.0.1', '::1'] as const

export function isLoopbackHostname(hostname: string): boolean {
  return (LOOPBACK_HOSTNAMES as readonly string[]).includes(hostname)
}

/**
 * True when a request host targets the application's own origin.
 *
 * Plain loopback hostnames (localhost, 127.0.0.1, ::1) carry no application
 * identity — in development every application shares them and is separated by
 * port — so they are matched by port. Named hosts are matched by hostname.
 *
 * This matters for internal requests the dev server makes against its own
 * origin (for example when following a server-action redirect): without the
 * port check, `localhost:3001` would be resolved to the storefront application
 * and cross-redirected away from the admin application.
 */
export function isOwnOriginRequest(
  host: string | null | undefined,
  application: ApplicationDefinition,
): boolean {
  const parsed = parseHost(host)
  if (!parsed) return false

  let selfUrl: URL
  try {
    selfUrl = new URL(application.url)
  } catch {
    return false
  }

  if (isLoopbackHostname(parsed.hostname)) {
    const selfPort = selfUrl.port || (selfUrl.protocol === 'https:' ? '443' : '80')
    return parsed.port !== null && parsed.port === selfPort
  }

  return parsed.hostname === selfUrl.hostname
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
