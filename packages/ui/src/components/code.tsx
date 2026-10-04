import { cn } from '@repo/utils'
import type { HTMLAttributes } from 'react'

export function InlineCode({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        'rounded border border-border bg-subtle px-1.5 py-0.5 font-mono text-[0.85em] text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function CodeBlock({ className, ...props }: HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-small leading-relaxed text-foreground',
        className,
      )}
      {...props}
    />
  )
}
