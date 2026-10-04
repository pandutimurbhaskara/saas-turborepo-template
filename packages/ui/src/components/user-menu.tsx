'use client'

import { cn } from '@repo/utils'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

export interface UserMenuLink {
  href: string
  label: string
}

export interface UserMenuProps {
  name: string | null
  email: string
  image?: string | null
  links?: UserMenuLink[]
  signOutAction: () => Promise<void>
  className?: string
}

export function UserMenu({
  name,
  email,
  image,
  links = [],
  signOutAction,
  className,
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'rounded-full p-0.5 transition-colors hover:bg-subtle focus-visible:shadow-focus focus-visible:outline-none',
          className,
        )}
        aria-label="Account menu"
      >
        <Avatar>
          <AvatarImage src={image ?? undefined} alt={name ?? email} />
          <AvatarFallback name={name ?? email} />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex flex-col gap-0.5 px-2.5 py-2">
          <p className="truncate text-ui font-medium text-foreground">{name ?? 'Account'}</p>
          <p className="truncate text-caption text-muted-foreground">{email}</p>
        </div>
        <DropdownMenuSeparator />
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full text-error [&_svg]:text-error">
              <LogOut />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
