import { describe, expect, it } from 'vitest'

import { buildProductImageKey, isSupportedImageMimeType, StorageError } from './objects'

describe('buildProductImageKey', () => {
  it('builds a products/<uuid> key with the right extension', () => {
    expect(buildProductImageKey('image/png')).toMatch(/^products\/[0-9a-f-]{36}\.png$/)
    expect(buildProductImageKey('image/jpeg')).toMatch(/^products\/[0-9a-f-]{36}\.jpg$/)
  })

  it('rejects unsupported mime types', () => {
    expect(() => buildProductImageKey('image/gif')).toThrow(StorageError)
    expect(() => buildProductImageKey('application/pdf')).toThrow(StorageError)
  })

  it('generates unique keys', () => {
    expect(buildProductImageKey('image/webp')).not.toBe(buildProductImageKey('image/webp'))
  })
})

describe('isSupportedImageMimeType', () => {
  it('accepts the allow-list and rejects others', () => {
    expect(isSupportedImageMimeType('image/jpeg')).toBe(true)
    expect(isSupportedImageMimeType('image/avif')).toBe(true)
    expect(isSupportedImageMimeType('image/svg+xml')).toBe(false)
  })
})
