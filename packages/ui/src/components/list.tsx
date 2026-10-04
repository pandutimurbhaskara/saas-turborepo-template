import { cn } from '@repo/utils'
import type { HTMLAttributes } from 'react'

export function List({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn('divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface', className)}
      {...props}
    />
  )
}

export function ListItem({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3 text-ui transition-colors hover:bg-subtle/60',
        className,
      )}
      {...props}
    />
  )
}

export function ListItemContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex min-w-0 flex-col gap-0.5', className)} {...props} />
}

export function ListItemTitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('truncate font-medium text-foreground', className)} {...props} />
}

export function ListItemDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('truncate text-small text-muted-foreground', className)} {...props} />
}
