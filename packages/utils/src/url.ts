export function isSafeRedirect(path: string | null | undefined): path is string {
  if (!path) return false
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  if (path.includes('\\')) return false
  return true
}

export function safeRedirectPath(path: string | null | undefined, fallback = '/'): string {
  return isSafeRedirect(path) ? path : fallback
}

export function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export function joinUrl(base: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${stripTrailingSlash(base)}${normalizedPath}`
}

export function absoluteUrl(path: string, base: string): string {
  return new URL(path, base).toString()
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
