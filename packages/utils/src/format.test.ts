import { describe, expect, it } from 'vitest'

import { getInitials } from './format'
import { slugify } from './slug'

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('strips accents and punctuation', () => {
    expect(slugify('  Café Déjà Vu!  ')).toBe('cafe-deja-vu')
  })

  it('collapses repeated separators', () => {
    expect(slugify('a -- b__c')).toBe('a-b-c')
  })

  it('handles empty input', () => {
    expect(slugify('')).toBe('')
    expect(slugify('!!!')).toBe('')
  })
})

describe('getInitials', () => {
  it('uses first letters of names', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL')
  })

  it('derives initials from an email local part', () => {
    expect(getInitials('ada@example.com')).toBe('AD')
  })

  it('falls back for empty values', () => {
    expect(getInitials(null)).toBe('?')
    expect(getInitials('')).toBe('?')
  })
})
