import { Slot } from '@radix-ui/react-slot'
import { cn } from '@repo/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:-translate-y-px focus-visible:shadow-focus focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-glow',
        secondary: 'border border-border bg-transparent text-foreground hover:bg-subtle',
        ghost: 'text-foreground hover:text-primary',
        destructive: 'border border-error text-error hover:bg-error/5',
      },
      size: {
        sm: 'h-8 px-3 text-small',
        md: 'h-[38px] px-4 text-ui',
        lg: 'h-11 px-6 text-body',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button'
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
