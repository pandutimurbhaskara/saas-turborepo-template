const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

const numberFormatter = new Intl.NumberFormat('en-US')

const RELATIVE_STEPS = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
] as const satisfies ReadonlyArray<{ amount: number; unit: Intl.RelativeTimeFormatUnit }>

export function formatDate(value: Date | string | number): string {
  return dateFormatter.format(new Date(value))
}

export function formatDateTime(value: Date | string | number): string {
  return dateTimeFormatter.format(new Date(value))
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatRelativeTime(value: Date | string | number, base: Date = new Date()): string {
  let duration = (new Date(value).getTime() - base.getTime()) / 1000

  for (const step of RELATIVE_STEPS) {
    if (Math.abs(duration) < step.amount) {
      return relativeTimeFormatter.format(Math.round(duration), step.unit)
    }
    duration /= step.amount
  }

  return relativeTimeFormatter.format(Math.round(duration), 'year')
}

export function getInitials(value: string | null | undefined): string {
  if (!value) return '?'

  const source = value.split('@')[0]?.replace(/[^a-zA-Z0-9]+/g, ' ') ?? ''
  const parts = source.trim().split(/\s+/).filter(Boolean)

  const first = parts[0]?.[0] ?? '?'
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? ''

  return `${first}${second}`.toUpperCase()
}
