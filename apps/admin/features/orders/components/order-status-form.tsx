'use client'

import { ORDER_STATUSES, type FormState, type OrderStatus } from '@repo/types'
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { updateOrderStatusAction } from '@/features/orders/actions'
import { ORDER_STATUS_LABELS } from '@/features/orders/components/order-status-badge'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Updating…' : 'Update status'}
    </Button>
  )
}

export interface OrderStatusFormProps {
  orderId: string
  status: OrderStatus
}

export function OrderStatusForm({ orderId, status }: OrderStatusFormProps) {
  const [state, formAction] = useActionState(updateOrderStatusAction, {
    status: 'idle',
  } as FormState)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="orderId" value={orderId} />

      {state.status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-error/20 bg-error/5 px-3.5 py-2.5 text-small text-error"
        >
          {state.message}
        </div>
      )}
      {state.status === 'success' && (
        <div
          role="status"
          className="rounded-md border border-success/20 bg-success/5 px-3.5 py-2.5 text-small text-success"
        >
          {state.message}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>Status</Label>
        <Select name="status" defaultValue={status}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ORDER_STATUSES).map((value) => (
              <SelectItem key={value} value={value}>
                {ORDER_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
