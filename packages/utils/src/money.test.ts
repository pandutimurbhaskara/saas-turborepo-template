import { describe, expect, it } from 'vitest'

import { formatCurrency, generateOrderNumber, parsePriceToCents } from './money'

describe('formatCurrency', () => {
  it('formats integer cents as currency', () => {
    expect(formatCurrency(1999)).toBe('$19.99')
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(123456)).toBe('$1,234.56')
  })

  it('supports other currencies', () => {
    expect(formatCurrency(1999, 'EUR')).toBe('€19.99')
  })
})

describe('parsePriceToCents', () => {
  it('parses plain and decimal prices', () => {
    expect(parsePriceToCents('19')).toBe(1900)
    expect(parsePriceToCents('19.9')).toBe(1990)
    expect(parsePriceToCents('19.99')).toBe(1999)
    expect(parsePriceToCents(' 0.01 ')).toBe(1)
  })

  it('rejects invalid input', () => {
    expect(parsePriceToCents('')).toBeNull()
    expect(parsePriceToCents('abc')).toBeNull()
    expect(parsePriceToCents('-5')).toBeNull()
    expect(parsePriceToCents('19.999')).toBeNull()
    expect(parsePriceToCents('1,99')).toBeNull()
  })
})

describe('generateOrderNumber', () => {
  it('produces ORD- prefixed numbers', () => {
    expect(generateOrderNumber()).toMatch(/^ORD-[A-Z2-9]{8}$/)
  })

  it('produces unique values', () => {
    expect(generateOrderNumber()).not.toBe(generateOrderNumber())
  })
})
