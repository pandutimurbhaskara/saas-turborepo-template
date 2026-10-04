import { cn } from '@repo/utils'
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-surface">
      <table
        className={cn('w-full caption-bottom border-collapse text-left', className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('[&_tr]:border-b [&_tr]:border-border', className)} {...props} />
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-subtle/60 data-[state=selected]:bg-subtle',
        className,
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('h-11 px-4 text-overline uppercase text-muted-foreground', className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 align-middle text-ui text-foreground', className)} {...props} />
  )
}

export function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('py-4 text-small text-muted-foreground', className)} {...props} />
}
