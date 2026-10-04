'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@repo/utils'
import { getInitials } from '@repo/utils'
import type { ComponentProps } from 'react'

export function Avatar({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex size-9 shrink-0 overflow-hidden rounded-full border border-border',
        className,
      )}
      {...props}
    />
  )
}

export function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  )
}

export interface AvatarFallbackProps extends ComponentProps<typeof AvatarPrimitive.Fallback> {
  name?: string | null
}

export function AvatarFallback({ className, name, children, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-subtle text-caption font-medium text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children ?? getInitials(name)}
    </AvatarPrimitive.Fallback>
  )
}
