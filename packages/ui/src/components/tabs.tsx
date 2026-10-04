'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@repo/utils'
import type { ComponentProps } from 'react'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex items-center gap-1 rounded-lg bg-subtle p-1', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-3 py-1.5 text-small font-medium text-muted-foreground transition-colors duration-200 focus-visible:shadow-focus focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-border data-[state=active]:bg-surface data-[state=active]:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('mt-4 focus-visible:outline-none', className)}
      {...props}
    />
  )
}
