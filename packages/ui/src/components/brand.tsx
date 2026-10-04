import { cn } from '@repo/utils'
import Link from 'next/link'

export interface BrandProps {
  name?: string
  secondary?: string
  href?: string
  className?: string
}

export function Brand({ name = 'Acme', secondary, href = '/', className }: BrandProps) {
  return (
    <Link href={href} className={cn('flex items-center gap-2', className)}>
      <span className="flex size-6 items-center justify-center rounded-md bg-primary font-display text-caption font-bold text-primary-foreground">
        {name.charAt(0)}
      </span>
      <span className="font-display text-[15px] font-bold tracking-[-0.02em]">
        {name}
        {secondary && <span className="ml-1.5 font-medium text-muted-foreground">{secondary}</span>}
      </span>
    </Link>
  )
}
