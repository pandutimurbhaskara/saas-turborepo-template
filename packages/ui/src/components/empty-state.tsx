import { cn } from '@repo/utils'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <span className="flex size-10 items-center justify-center rounded-full bg-subtle text-muted-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-semibold tracking-[-0.01em]">{title}</h3>
        {description && (
          <p className="mx-auto max-w-sm text-ui text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
