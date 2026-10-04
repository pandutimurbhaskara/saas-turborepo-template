import { cn } from '@repo/utils'
import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

export interface ErrorStateProps {
  status?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function ErrorState({ status, title, description, actions, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-20 text-center',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertTriangle className="size-5" />
      </span>
      <div className="flex flex-col gap-2">
        {status && <p className="text-overline uppercase text-error">{status}</p>}
        <h1 className="font-display text-heading tracking-[-0.03em]">{title}</h1>
        {description && (
          <p className="mx-auto max-w-md text-ui text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      )}
    </div>
  )
}
