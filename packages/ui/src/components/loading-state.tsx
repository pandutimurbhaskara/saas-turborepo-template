import { cn } from '@repo/utils'

export interface LoadingStateProps {
  label?: string
  className?: string
}

export function LoadingState({ label = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      role="status"
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}
    >
      <span className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      <p className="text-small text-muted-foreground">{label}</p>
    </div>
  )
}
