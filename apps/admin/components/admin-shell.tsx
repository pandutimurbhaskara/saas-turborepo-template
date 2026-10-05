'use client'

import * as Dialog from '@radix-ui/react-dialog'
import {
  Brand,
  Button,
  SearchCommand,
  SidebarNav,
  ThemeToggle,
  UserMenu,
  type SidebarNavItem,
} from '@repo/ui'
import { LayoutDashboard, Menu, Package, ReceiptText, Settings, Tags, Users, X } from 'lucide-react'
import { useState } from 'react'

import { APP_NAME, APP_SECONDARY } from '@/lib/app'

const NAV_ITEMS: SidebarNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/orders', label: 'Orders', icon: ReceiptText },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const SEARCH_ITEMS = NAV_ITEMS.map((item) => ({ href: item.href, label: item.label }))

export interface AdminShellUser {
  name: string | null
  email: string
  image: string | null
}

export interface AdminShellProps {
  user: AdminShellUser
  signOutAction: () => Promise<void>
  children: React.ReactNode
}

export function AdminShell({ user, signOutAction, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const brand = <Brand name={APP_NAME} secondary={APP_SECONDARY} />

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-14 items-center border-b border-border px-4">{brand}</div>
        <div className="flex flex-1 flex-col p-4">
          <SidebarNav items={NAV_ITEMS} />
        </div>
        <div className="border-t border-border px-4 py-4">
          <p className="text-caption text-subtle-foreground">
            Shared infrastructure, isolated application.
          </p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <Dialog.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 px-0"
                  aria-label="Open navigation"
                >
                  <Menu className="size-5" />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in lg:hidden dark:bg-black/60" />
                <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 border-l border-border bg-surface p-6 shadow-lg data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in lg:hidden">
                  <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Navigate the admin console.
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
                  <SidebarNav
                    items={NAV_ITEMS}
                    onNavigate={() => setMobileOpen(false)}
                    className="flex-1"
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <span className="lg:hidden">{brand}</span>
          </div>
          <p className="hidden text-small text-muted-foreground lg:block">Administration console</p>
          <div className="flex items-center gap-2">
            <SearchCommand items={SEARCH_ITEMS} className="hidden sm:flex" />
            <ThemeToggle />
            <UserMenu
              name={user.name}
              email={user.email}
              image={user.image}
              signOutAction={signOutAction}
              links={[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/settings', label: 'Settings' },
              ]}
            />
          </div>
        </header>
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </div>
  )
}
