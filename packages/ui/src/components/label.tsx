'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@repo/utils'
import type { ComponentProps } from 'react'

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-ui font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}
