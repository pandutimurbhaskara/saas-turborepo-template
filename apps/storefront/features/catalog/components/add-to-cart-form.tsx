'use client'

import type { FormState } from '@repo/types'
import { Button, Input, Label } from '@repo/ui'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { addToCartAction } from '@/features/cart/actions'

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" disabled={disabled || pending}>
      {pending ? 'Adding…' : 'Add to cart'}
    </Button>
  )
}

export interface AddToCartFormProps {
  productId: string
  stock: number
}

export function AddToCartForm({ productId, stock }: AddToCartFormProps) {
  const [state, formAction] = useActionState(addToCartAction, {
    status: 'idle',
  } as FormState)

  const maxQuantity = Math.max(1, Math.min(stock, 99))
  const outOfStock = stock <= 0

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="productId" value={productId} />

      {state.status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-error/20 bg-error/5 px-3.5 py-2.5 text-small text-error"
        >
          {state.message}
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={maxQuantity}
            step={1}
            defaultValue={1}
            className="w-24"
            disabled={outOfStock}
          />
        </div>
        <SubmitButton disabled={outOfStock} />
      </div>

      {outOfStock ? (
        <p className="text-small text-warning">Currently out of stock.</p>
      ) : (
        <p className="text-small text-muted-foreground">{stock} in stock, ready to ship.</p>
      )}
    </form>
  )
}
