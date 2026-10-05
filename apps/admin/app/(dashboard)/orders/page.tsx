import { requireApplicationAccess } from '@repo/auth'
import { listOrdersAdmin } from '@repo/db'
import { ORDER_STATUSES, type OrderStatus } from '@repo/types'
import {
  Button,
  buttonVariants,
  EmptyState,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { cn, formatCurrency, formatDate, formatNumber } from '@repo/utils'
import { ReceiptText } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import {
  ORDER_STATUS_LABELS,
  OrderStatusBadge,
} from '@/features/orders/components/order-status-badge'

export const metadata: Metadata = {
  title: 'Orders',
}

const PAGE_SIZE = 15

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  await requireApplicationAccess('admin', { loginPath: '/login', forbiddenPath: '/forbidden' })

  const params = await searchParams
  const status = (Object.values(ORDER_STATUSES) as string[]).includes(params.status ?? '')
    ? (params.status as OrderStatus)
    : undefined
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)

  const { items, total } = await listOrdersAdmin({ status, page, pageSize: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildHref(overrides: { status?: string; page?: number } = {}) {
    const search = new URLSearchParams()
    const nextStatus = overrides.status === undefined ? (status ?? '') : overrides.status
    if (nextStatus) search.set('status', nextStatus)
    const nextPage = overrides.page ?? page
    if (nextPage > 1) search.set('page', String(nextPage))
    const query = search.toString()
    return query ? `/orders?${query}` : '/orders'
  }

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Transactions"
        title="Orders"
        description="Every order placed through the storefront, newest first."
      />

      <div className="flex flex-wrap gap-2">
        <Button variant={status === undefined ? 'primary' : 'secondary'} size="sm" asChild>
          <Link href={buildHref({ status: '' })}>All</Link>
        </Button>
        {Object.values(ORDER_STATUSES).map((value) => (
          <Button
            key={value}
            variant={status === value ? 'primary' : 'secondary'}
            size="sm"
            asChild
          >
            <Link href={buildHref({ status: value })}>{ORDER_STATUS_LABELS[value]}</Link>
          </Button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No orders found"
          description={
            status
              ? 'No orders match this status filter yet.'
              : 'Orders placed through the storefront will appear here.'
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono">{order.orderNumber}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium">{order.customerName ?? 'Customer'}</p>
                    <p className="text-small text-muted-foreground">{order.email}</p>
                  </div>
                </TableCell>
                <TableCell>{formatNumber(order.itemCount)}</TableCell>
                <TableCell>{formatCurrency(order.totalCents)}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/orders/${order.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-between">
        <p className="text-small text-muted-foreground">
          {formatNumber(total)} order{total === 1 ? '' : 's'} · page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Link
            href={buildHref({ page: page - 1 })}
            aria-disabled={page <= 1}
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'sm' }),
              page <= 1 && 'pointer-events-none opacity-50',
            )}
          >
            Previous
          </Link>
          <Link
            href={buildHref({ page: page + 1 })}
            aria-disabled={page >= totalPages}
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'sm' }),
              page >= totalPages && 'pointer-events-none opacity-50',
            )}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  )
}
