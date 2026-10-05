import { requireAuth } from '@repo/auth'
import { listOrdersForUser } from '@repo/db'
import {
  Button,
  EmptyState,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { formatCurrency, formatDate, formatNumber } from '@repo/utils'
import { ReceiptText } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { OrderStatusBadge } from '@/features/orders/components/order-status-badge'

export const metadata: Metadata = {
  title: 'Orders',
}

export default async function OrdersPage() {
  const user = await requireAuth({ loginPath: '/login' })
  const orders = await listOrdersForUser(user.id)

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Account"
        title="Orders"
        description="Every order you have placed through the store."
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No orders yet"
          description="Once you place an order it will show up here with its current status."
          action={
            <Button asChild>
              <Link href="/products">Shop products</Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono">{order.orderNumber}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>{formatNumber(order.itemCount)}</TableCell>
                <TableCell>{formatCurrency(order.totalCents)}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/orders/${order.orderNumber}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
