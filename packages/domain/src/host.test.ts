import { describe, expect, it } from 'vitest'

import { getSubdomain, isIpAddress, parseHost } from './host'

describe('parseHost', () => {
  it('parses a bare hostname', () => {
    expect(parseHost('example.com')).toEqual({ hostname: 'example.com', port: null })
  })

  it('parses hostname and port', () => {
    expect(parseHost('admin.example.com:3001')).toEqual({
      hostname: 'admin.example.com',
      port: '3001',
    })
  })

  it('normalizes protocol and casing', () => {
    expect(parseHost('HTTPS://Example.COM:443')).toEqual({
      hostname: 'example.com',
      port: '443',
    })
  })

  it('strips paths, queries and trailing dots', () => {
    expect(parseHost('example.com/dashboard?tab=1')).toEqual({
      hostname: 'example.com',
      port: null,
    })
    expect(parseHost('example.com.')).toEqual({ hostname: 'example.com', port: null })
  })

  it('parses ipv6 literals', () => {
    expect(parseHost('[::1]:3000')).toEqual({ hostname: '::1', port: '3000' })
  })

  it('ignores non-numeric ports', () => {
    expect(parseHost('example.com:abc')).toEqual({ hostname: 'example.com', port: null })
  })

  it('returns null for empty input', () => {
    expect(parseHost(null)).toBeNull()
    expect(parseHost(undefined)).toBeNull()
    expect(parseHost('')).toBeNull()
    expect(parseHost('   ')).toBeNull()
  })
})

describe('getSubdomain', () => {
  it('extracts the subdomain segment', () => {
    expect(getSubdomain('admin.example.com', 'example.com')).toBe('admin')
    expect(getSubdomain('seller.example.com:3002', 'example.com')).toBe('seller')
    expect(getSubdomain('a.b.example.com', 'example.com')).toBe('a.b')
  })

  it('returns null on the apex domain', () => {
    expect(getSubdomain('example.com', 'example.com')).toBeNull()
  })

  it('returns null for unrelated hosts', () => {
    expect(getSubdomain('example.com', 'localhost')).toBeNull()
    expect(getSubdomain('evilexample.com', 'example.com')).toBeNull()
  })

  it('works with localhost development hosts', () => {
    expect(getSubdomain('admin.localhost', 'localhost')).toBe('admin')
    expect(getSubdomain('localhost:3000', 'localhost')).toBeNull()
  })

  it('returns null for invalid input', () => {
    expect(getSubdomain(null, 'example.com')).toBeNull()
    expect(getSubdomain('admin.example.com', '')).toBeNull()
  })
})

describe('isIpAddress', () => {
  it('detects ipv4 and ipv6 addresses', () => {
    expect(isIpAddress('127.0.0.1')).toBe(true)
    expect(isIpAddress('::1')).toBe(true)
    expect(isIpAddress('example.com')).toBe(false)
    expect(isIpAddress(null)).toBe(false)
  })
})
