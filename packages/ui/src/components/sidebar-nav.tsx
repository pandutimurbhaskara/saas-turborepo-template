'use client'

import { cn, isActivePath } from '@repo/utils'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface SidebarNavItem {
  href: string
  label: string
  icon?: LucideIcon
  exact?: boolean
}

export interface SidebarNavProps {
  items: SidebarNavItem[]
  onNavigate?: () => void
  className?: string
}

export function SidebarNav({ items, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex flex-col gap-1', className)} aria-label="Sidebar">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : isActivePath(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-ui font-medium transition-colors duration-200',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-subtle hover:text-foreground',
            )}
          >
            {item.icon && <item.icon className="size-4 shrink-0" />}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
