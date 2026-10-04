import { ROLES } from '@repo/types'
import { describe, expect, it } from 'vitest'

import {
  buildApplicationRegistry,
  getApplicationByKey,
  getApplicationFromHost,
  getApplicationUrl,
  isReservedSubdomain,
  RESERVED_SUBDOMAINS,
  resolveHost,
} from './applications'

const registry = buildApplicationRegistry({
  domain: 'example.com',
  applications: {
    user: { url: 'https://example.com' },
    admin: { url: 'https://admin.example.com' },
  },
})

const localRegistry = buildApplicationRegistry({
  domain: 'localhost',
  applications: {
    user: { url: 'http://localhost:3000' },
    admin: { url: 'http://admin.localhost:3001' },
  },
})

describe('buildApplicationRegistry', () => {
  it('builds application definitions from configuration', () => {
    expect(registry.domain).toBe('example.com')
    expect(registry.applications).toHaveLength(2)

    const admin = getApplicationByKey('admin', registry)
    expect(admin).toMatchObject({
      key: 'admin',
      host: 'admin.example.com',
      url: 'https://admin.example.com',
      subdomain: 'admin',
      enabled: true,
      roles: [ROLES.ADMIN],
    })

    const user = getApplicationByKey('user', registry)
    expect(user?.subdomain).toBeNull()
    expect(user?.roles).toEqual([ROLES.USER, ROLES.ADMIN, ROLES.SELLER])
  })

  it('omits applications without a configured url', () => {
    expect(getApplicationByKey('seller', registry)).toBeNull()
  })

  it('includes optional applications when configured', () => {
    const extended = buildApplicationRegistry({
      domain: 'example.com',
      applications: {
        user: { url: 'https://example.com' },
        admin: { url: 'https://admin.example.com' },
        seller: { url: 'https://seller.example.com' },
      },
    })

    expect(getApplicationByKey('seller', extended)).toMatchObject({
      host: 'seller.example.com',
      subdomain: 'seller',
      roles: [ROLES.SELLER],
    })
  })

  it('throws on an invalid domain', () => {
    expect(() =>
      buildApplicationRegistry({ domain: '', applications: { user: { url: 'https://x.com' } } }),
    ).toThrow(/invalid application domain/i)
  })
})

describe('getApplicationFromHost', () => {
  it('resolves the apex domain to the user application', () => {
    expect(getApplicationFromHost('example.com', registry)?.key).toBe('user')
    expect(getApplicationFromHost('example.com:3000', registry)?.key).toBe('user')
  })

  it('resolves subdomains to their application', () => {
    expect(getApplicationFromHost('admin.example.com', registry)?.key).toBe('admin')
    expect(getApplicationFromHost('admin.example.com:443', registry)?.key).toBe('admin')
  })

  it('is case insensitive and protocol tolerant', () => {
    expect(getApplicationFromHost('HTTPS://ADMIN.EXAMPLE.COM', registry)?.key).toBe('admin')
  })

  it('returns null for unknown hosts', () => {
    expect(getApplicationFromHost('www.example.com', registry)).toBeNull()
    expect(getApplicationFromHost('unknown.test', registry)).toBeNull()
    expect(getApplicationFromHost(null, registry)).toBeNull()
  })

  it('resolves local development hosts', () => {
    expect(getApplicationFromHost('localhost:3000', localRegistry)?.key).toBe('user')
    expect(getApplicationFromHost('admin.localhost:3001', localRegistry)?.key).toBe('admin')
  })
})

describe('getApplicationUrl', () => {
  it('joins the application url with a path', () => {
    expect(getApplicationUrl('admin', '/users', registry)).toBe('https://admin.example.com/users')
    expect(getApplicationUrl('user', '/', registry)).toBe('https://example.com/')
  })

  it('returns null for applications that are not configured', () => {
    expect(getApplicationUrl('seller', '/', registry)).toBeNull()
  })
})

describe('resolveHost', () => {
  it('returns a full resolution for known hosts', () => {
    expect(resolveHost('admin.example.com:3001', registry)).toEqual({
      application: expect.objectContaining({ key: 'admin' }),
      hostname: 'admin.example.com',
      port: '3001',
      subdomain: 'admin',
      isReservedSubdomain: true,
    })
  })

  it('flags reserved but unregistered subdomains', () => {
    expect(resolveHost('api.example.com', registry)).toEqual({
      application: null,
      hostname: 'api.example.com',
      port: null,
      subdomain: 'api',
      isReservedSubdomain: true,
    })
  })

  it('returns null for invalid hosts', () => {
    expect(resolveHost(undefined, registry)).toBeNull()
  })
})

describe('isReservedSubdomain', () => {
  it('matches the centralized reserved list', () => {
    for (const subdomain of RESERVED_SUBDOMAINS) {
      expect(isReservedSubdomain(subdomain)).toBe(true)
    }
    expect(isReservedSubdomain('customer')).toBe(false)
    expect(isReservedSubdomain(null)).toBe(false)
  })
})
