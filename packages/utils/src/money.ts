const currencyFormatters = new Map<string, Intl.NumberFormat>()

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  let formatter = currencyFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency })
    currencyFormatters.set(currency, formatter)
  }
  return formatter
}

export function formatCurrency(cents: number, currency = 'USD'): string {
  return getCurrencyFormatter(currency).format(cents / 100)
}

export function parsePriceToCents(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null

  const parts = trimmed.split('.')
  const whole = parts[0] ?? ''
  const fraction = parts[1] ?? ''

  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(cents) ? cents : null
}

const ORDER_NUMBER_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateOrderNumber(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)

  const suffix = Array.from(bytes, (byte) =>
    ORDER_NUMBER_ALPHABET.charAt(byte % ORDER_NUMBER_ALPHABET.length),
  ).join('')

  return `ORD-${suffix}`
}
