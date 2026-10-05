import type { OrderStatus } from '@repo/types'
import { Badge } from '@repo/ui'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const ORDER_STATUS_VARIANTS: Record<
  OrderStatus,
  'default' | 'primary' | 'success' | 'warning' | 'error'
> = {
  pending: 'warning',
  processing: 'default',
  shipped: 'primary',
  completed: 'success',
  cancelled: 'error',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={ORDER_STATUS_VARIANTS[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
}
