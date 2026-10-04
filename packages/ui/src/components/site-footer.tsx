import { cn } from '@repo/utils'
import Link from 'next/link'
import type { ReactNode } from 'react'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface SiteFooterProps {
  brand?: ReactNode
  description?: string
  columns?: FooterColumn[]
  copyright?: string
  className?: string
}

export function SiteFooter({ brand, description, columns, copyright, className }: SiteFooterProps) {
  return (
    <footer className={cn('border-t border-border bg-surface', className)}>
      <div className="mx-auto grid max-w-site gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {brand}
          {description && <p className="max-w-sm text-ui text-muted-foreground">{description}</p>}
        </div>
        {columns?.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <p className="text-overline uppercase text-subtle-foreground">{column.title}</p>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-ui text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {copyright && (
        <div className="border-t border-border">
          <p className="mx-auto max-w-site px-6 py-6 text-caption text-subtle-foreground">{copyright}</p>
        </div>
      )}
    </footer>
  )
}
