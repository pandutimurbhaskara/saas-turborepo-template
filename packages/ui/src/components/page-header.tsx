import { cn } from '@repo/utils'
import type { ReactNode } from 'react'

export interface PageHeaderProps {
  overline?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ overline, title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="flex flex-col gap-1.5">
        {overline && <p className="text-overline uppercase text-primary">{overline}</p>}
        <h1 className="font-display text-heading tracking-[-0.03em]">{title}</h1>
        {description && <p className="max-w-2xl text-ui text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  )
}
