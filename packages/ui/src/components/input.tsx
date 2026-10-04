import { cn } from '@repo/utils'
import type { InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-ui text-foreground transition-[border-color,box-shadow] duration-200 placeholder:text-subtle-foreground focus-visible:border-primary focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error',
        className,
      )}
      {...props}
    />
  )
}
