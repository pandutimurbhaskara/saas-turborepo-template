import { describe, expect, it } from 'vitest'

import { absoluteUrl, isSafeRedirect, joinUrl, safeRedirectPath, stripTrailingSlash } from './url'

describe('isSafeRedirect', () => {
  it('accepts internal absolute paths', () => {
    expect(isSafeRedirect('/dashboard')).toBe(true)
    expect(isSafeRedirect('/dashboard?tab=1')).toBe(true)
    expect(isSafeRedirect('/')).toBe(true)
  })

  it('rejects protocol-relative redirects', () => {
    expect(isSafeRedirect('//evil.com')).toBe(false)
    expect(isSafeRedirect('//evil.com/path')).toBe(false)
  })

  it('rejects absolute URLs', () => {
    expect(isSafeRedirect('https://evil.com')).toBe(false)
    expect(isSafeRedirect('javascript:alert(1)')).toBe(false)
  })

  it('rejects backslash-tricked redirects', () => {
    expect(isSafeRedirect('/\\evil.com')).toBe(false)
    expect(isSafeRedirect('/path\\to')).toBe(false)
  })

  it('rejects empty values', () => {
    expect(isSafeRedirect(null)).toBe(false)
    expect(isSafeRedirect(undefined)).toBe(false)
    expect(isSafeRedirect('')).toBe(false)
  })
})

describe('safeRedirectPath', () => {
  it('returns the path when safe', () => {
    expect(safeRedirectPath('/settings')).toBe('/settings')
  })

  it('falls back when unsafe or missing', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/')
    expect(safeRedirectPath(undefined)).toBe('/')
    expect(safeRedirectPath(null, '/login')).toBe('/login')
  })
})

describe('joinUrl', () => {
  it('joins base and path with exactly one slash', () => {
    expect(joinUrl('https://example.com', '/dashboard')).toBe('https://example.com/dashboard')
    expect(joinUrl('https://example.com/', '/dashboard')).toBe('https://example.com/dashboard')
    expect(joinUrl('https://example.com/', 'dashboard')).toBe('https://example.com/dashboard')
    expect(joinUrl('http://admin.localhost:3001', '/users')).toBe('http://admin.localhost:3001/users')
  })
})

describe('stripTrailingSlash', () => {
  it('removes a single trailing slash', () => {
    expect(stripTrailingSlash('https://example.com/')).toBe('https://example.com')
    expect(stripTrailingSlash('https://example.com')).toBe('https://example.com')
  })
})

describe('absoluteUrl', () => {
  it('resolves a path against a base', () => {
    expect(absoluteUrl('/dashboard', 'https://example.com')).toBe('https://example.com/dashboard')
  })
})
