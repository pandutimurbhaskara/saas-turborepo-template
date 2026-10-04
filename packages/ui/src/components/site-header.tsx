'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { cn, isActivePath } from '@repo/utils'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'

import { Button } from './button'
import { SearchCommand, type SearchCommandItem } from './search-command'

export interface SiteHeaderNavItem {
  href: string
  label: string
}

export interface SiteHeaderProps {
  brand: ReactNode
  navigation?: SiteHeaderNavItem[]
  actions?: ReactNode
  searchItems?: SearchCommandItem[]
  className?: string
}

export function SiteHeader({
  brand,
  navigation = [],
  actions,
  searchItems,
  className,
}: SiteHeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-site items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-6">
          {brand}
          {navigation.length > 0 && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-ui font-medium transition-colors duration-200',
                    isActivePath(pathname, item.href)
                      ? 'bg-subtle text-primary'
                      : 'text-muted-foreground hover:bg-subtle hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {searchItems && searchItems.length > 0 && (
            <SearchCommand items={searchItems} className="hidden sm:flex" />
          )}
          {actions}
          {navigation.length > 0 && (
            <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <Dialog.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 px-0 md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="size-5" />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in md:hidden dark:bg-black/60" />
                <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 border-l border-border bg-surface p-6 shadow-lg data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in md:hidden">
                  <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Navigate within this application.
                  </Dialog.Description>
                  <div className="flex items-center justify-between">
                    {brand}
                    <Dialog.Close
                      className="rounded-md p-1 text-subtle-foreground transition-colors hover:bg-subtle hover:text-foreground"
                      aria-label="Close navigation"
                    >
                      <X className="size-4" />
                    </Dialog.Close>
                  </div>
                  <nav className="flex flex-col gap-1" aria-label="Mobile">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'rounded-md px-3 py-2 text-ui font-medium transition-colors duration-200',
                          isActivePath(pathname, item.href)
                            ? 'bg-subtle text-primary'
                            : 'text-muted-foreground hover:bg-subtle hover:text-foreground',
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </div>
      </div>
    </header>
  )
}
