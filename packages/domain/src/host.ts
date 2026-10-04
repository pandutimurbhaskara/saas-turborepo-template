export interface ParsedHost {
  hostname: string
  port: string | null
}

const IPV4_PATTERN = /^\d{1,3}(?:\.\d{1,3}){3}$/

export function parseHost(input: string | null | undefined): ParsedHost | null {
  if (!input) return null

  let value = input.trim().toLowerCase()
  if (!value) return null

  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
  value = value.split('/')[0] ?? ''
  if (!value) return null

  if (value.startsWith('[')) {
    const closing = value.indexOf(']')
    if (closing === -1) return null

    const hostname = value.slice(1, closing)
    if (!hostname) return null

    const remainder = value.slice(closing + 1)
    if (!remainder) return { hostname, port: null }
    if (!remainder.startsWith(':')) return null

    const port = remainder.slice(1)
    return { hostname, port: port || null }
  }

  if (value.split(':').length > 2) {
    return { hostname: value, port: null }
  }

  const [hostnamePart = '', portPart] = value.split(':')
  const hostname = hostnamePart.replace(/\.$/, '')
  if (!hostname) return null

  return {
    hostname,
    port: portPart && /^\d+$/.test(portPart) ? portPart : null,
  }
}

export function getSubdomain(input: string | null | undefined, domain: string): string | null {
  const parsed = parseHost(input)
  const base = parseHost(domain)

  if (!parsed || !base) return null
  if (parsed.hostname === base.hostname) return null
  if (!parsed.hostname.endsWith(`.${base.hostname}`)) return null

  const subdomain = parsed.hostname.slice(0, -(base.hostname.length + 1))
  return subdomain || null
}

export function isIpAddress(hostname: string | null | undefined): boolean {
  if (!hostname) return false
  return IPV4_PATTERN.test(hostname) || hostname.includes(':')
}
