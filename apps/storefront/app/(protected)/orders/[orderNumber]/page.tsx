import { requireAuth } from '@repo/auth'
import { getOrderByNumberForUser } from '@repo/db'
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

export const metadata: Metadata = {
  title: 'Order',
}

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ placed?: string }>
}

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const user = await requireAuth({ loginPath: '/login' })

  const { orderNumber } = await params
  const { placed } = await searchParams

  const result = await getOrderByNumberForUser(orderNumber, user.id)
  if (!result) notFound()

  const { order, items } = result
  const address = order.shippingAddress

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-8 px-6 py-12">
      {placed === '1' && (
        <div
          role="status"
          className="rounded-md border border-success/20 bg-success/5 px-3.5 py-2.5 text-small text-success"
        >
          Order placed — thank you! A summary has been recorded in your order history.
        </div>
      )}

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
              {formatNumber(items.length)} line item{items.length === 1 ? '' : 's'}
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
                {items.map((item) => (
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
      </div>
    </div>
  )
}
