import { requireAuth } from '@repo/auth'
import { listOrdersForUser } from '@repo/db'
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from '@repo/ui'
import { formatCurrency, formatDate, formatNumber } from '@repo/utils'
import type { Metadata } from 'next'
import Link from 'next/link'

import { OrderStatusBadge } from '@/features/orders/components/order-status-badge'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const user = await requireAuth({ loginPath: '/login' })
  const orders = await listOrdersForUser(user.id)

  const totalSpentCents = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.totalCents, 0)
  const recentOrders = orders.slice(0, 3)

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Account"
        title={`Welcome back, ${user.name?.split(' ')[0] ?? 'there'}`}
        description="Your orders, account details and preferences in one place."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="size-12">
              <AvatarFallback name={user.name ?? user.email} />
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <CardTitle>{user.name ?? 'Unnamed account'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-small text-muted-foreground">
            <p>Member since {formatDate(user.createdAt)}</p>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge key={role} variant="primary">
                  {role}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="text-overline uppercase">Orders</CardDescription>
            <p className="font-display text-4xl font-bold tracking-[-0.03em]">
              {formatNumber(orders.length)}
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="text-overline uppercase">Total spent</CardDescription>
            <p className="font-display text-4xl font-bold tracking-[-0.03em]">
              {formatCurrency(totalSpentCents)}
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Your latest purchases.</CardDescription>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-small text-muted-foreground">
              You have not placed an order yet.{' '}
              <Link href="/products" className="text-primary hover:underline">
                Browse the catalog
              </Link>
              .
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="font-mono text-ui font-medium hover:text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-small text-muted-foreground">
                      {formatDate(order.createdAt)} · {formatNumber(order.itemCount)} item
                      {order.itemCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-ui">{formatCurrency(order.totalCents)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
