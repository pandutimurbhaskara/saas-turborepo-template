import { requireApplicationAccess } from '@repo/auth'
import { getOrderById } from '@repo/db'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { formatCurrency, formatDateTime, formatNumber } from '@repo/utils'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { OrderStatusBadge } from '@/features/orders/components/order-status-badge'
import { OrderStatusForm } from '@/features/orders/components/order-status-form'

export const metadata: Metadata = {
  title: 'Order',
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  await requireApplicationAccess('admin', { loginPath: '/login', forbiddenPath: '/forbidden' })

  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const address = order.shippingAddress

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Order"
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
            <CardDescription>
              {formatNumber(order.items.length)} line item{order.items.length === 1 ? '' : 's'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Unit price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{formatCurrency(item.priceCents)}</TableCell>
                    <TableCell>{formatNumber(item.quantity)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.priceCents * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-1.5 border-t border-border pt-4 text-ui">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotalCents)}</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(order.totalCents)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-ui text-muted-foreground">
              <p className="font-medium text-foreground">{order.customerName ?? 'Customer'}</p>
              <p>{order.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-ui text-muted-foreground">
              <p className="font-medium text-foreground">{address.fullName}</p>
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}
                {address.region ? `, ${address.region}` : ''} {address.postalCode}
              </p>
              <p>{address.country}</p>
              {address.phone && <p>{address.phone}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Cancelling an order restores the reserved stock.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusForm orderId={order.id} status={order.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
