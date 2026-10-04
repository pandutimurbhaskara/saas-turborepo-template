import { describe, expect, it } from 'vitest'

import { hashPassword, verifyPassword } from './password'

describe('hashPassword', () => {
  it('produces a salted scrypt hash that never contains the password', async () => {
    const hash = await hashPassword('correct horse battery staple')
    expect(hash).toMatch(/^scrypt:16384:8:1:[0-9a-f]{32}:[0-9a-f]{128}$/)
    expect(hash).not.toContain('correct horse')
  })

  it('produces unique hashes for the same password', async () => {
    const first = await hashPassword('same-password')
    const second = await hashPassword('same-password')
    expect(first).not.toBe(second)
  })
})

describe('verifyPassword', () => {
  it('verifies a correct password', async () => {
    const hash = await hashPassword('correct horse battery staple')
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true)
  })

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct horse battery staple')
    await expect(verifyPassword('wrong password', hash)).resolves.toBe(false)
  })

  it('rejects malformed hashes', async () => {
    await expect(verifyPassword('whatever', 'not-a-hash')).resolves.toBe(false)
    await expect(verifyPassword('whatever', 'scrypt:1:2:3:zz:zz')).resolves.toBe(false)
    await expect(verifyPassword('whatever', '')).resolves.toBe(false)
  })
})
