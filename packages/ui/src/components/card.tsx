import { cn } from '@repo/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

const cardVariants = cva('overflow-hidden rounded-xl border border-border bg-surface', {
  variants: {
    interactive: {
      true: 'transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-hover',
      false: '',
    },
  },
  defaultVariants: {
    interactive: false,
  },
})

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, interactive, ...props }: CardProps) {
  return <div className={cn(cardVariants({ interactive }), className)} {...props} />
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export function CardTitle({ className, as: Component = 'h3', ...props }: CardTitleProps) {
  return (
    <Component
      className={cn('font-display text-lg font-semibold tracking-[-0.01em]', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-ui text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-3 px-6 pb-6', className)} {...props} />
}
