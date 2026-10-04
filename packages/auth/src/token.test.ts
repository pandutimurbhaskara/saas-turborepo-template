import { describe, expect, it } from 'vitest'

import { generateSessionToken, hashSessionToken } from './token'

describe('generateSessionToken', () => {
  it('creates url-safe 256-bit tokens', () => {
    expect(generateSessionToken()).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })

  it('never repeats', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateSessionToken()))
    expect(tokens.size).toBe(50)
  })
})

describe('hashSessionToken', () => {
  it('is deterministic for the same token and secret', () => {
    const secret = 'a'.repeat(32)
    expect(hashSessionToken('session-token', secret)).toBe(hashSessionToken('session-token', secret))
  })

  it('produces a sha256-length hex digest', () => {
    expect(hashSessionToken('session-token', 'a'.repeat(32))).toMatch(/^[0-9a-f]{64}$/)
  })

  it('changes when the secret rotates', () => {
    const first = hashSessionToken('session-token', 'a'.repeat(32))
    const second = hashSessionToken('session-token', 'b'.repeat(32))
    expect(first).not.toBe(second)
  })

  it('never contains the raw token', () => {
    const token = 'session-token'
    expect(hashSessionToken(token, 'a'.repeat(32))).not.toContain(token)
  })
})
