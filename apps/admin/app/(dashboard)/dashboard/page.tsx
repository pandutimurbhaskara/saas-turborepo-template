import { getSession, requireApplicationAccess } from '@repo/auth'
import {
  countActiveProducts,
  countOrders,
  countProducts,
  listRecentOrders,
  sumRevenueCents,
} from '@repo/db'
import { getApplicationRegistry } from '@repo/domain'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  List,
  ListItem,
  ListItemContent,
  ListItemDescription,
  ListItemTitle,
  PageHeader,
} from '@repo/ui'
import { formatCurrency, formatNumber, formatRelativeTime } from '@repo/utils'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'

import { OrderStatusBadge } from '@/features/orders/components/order-status-badge'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function AdminDashboardPage() {
  await requireApplicationAccess('admin', { loginPath: '/login', forbiddenPath: '/forbidden' })

  const [productCount, activeProductCount, orderCount, revenueCents] = await Promise.all([
    countProducts(),
    countActiveProducts(),
    countOrders(),
    sumRevenueCents(),
  ])
  const recentOrders = await listRecentOrders(5)

  const session = await getSession()
  const requestHeaders = await headers()
  const host = requestHeaders.get('host') ?? 'unknown'
  const registry = getApplicationRegistry()

  const stats = [
    { label: 'Products', value: formatNumber(productCount) },
    { label: 'Active products', value: formatNumber(activeProductCount) },
    { label: 'Orders', value: formatNumber(orderCount) },
    { label: 'Revenue', value: formatCurrency(revenueCents) },
  ]

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Dashboard"
        title="Administration overview"
        description="Store figures straight from PostgreSQL through the shared database package."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription className="text-overline uppercase">{stat.label}</CardDescription>
              <p className="font-display text-4xl font-bold tracking-[-0.03em]">{stat.value}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="overflow-visible">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest transactions across the store.</CardDescription>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-small text-muted-foreground">
              No orders yet. Orders placed through the storefront will appear here.
            </p>
          ) : (
            <List className="border-0">
              {recentOrders.map((order) => (
                <ListItem key={order.id} className="px-0">
                  <ListItemContent>
                    <ListItemTitle className="font-mono">{order.orderNumber}</ListItemTitle>
                    <ListItemDescription>
                      {order.customerName ?? order.email} · {formatRelativeTime(order.createdAt)}
                    </ListItemDescription>
                  </ListItemContent>
                  <div className="flex items-center gap-3">
                    <span className="text-small text-muted-foreground">
                      {formatCurrency(order.totalCents)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Validated on the server on every request, cached per render pass.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-small text-muted-foreground">
            <p>Expires {session ? formatRelativeTime(session.session.expiresAt) : 'unknown'}</p>
            <p>
              Served by <span className="font-mono text-foreground">{host}</span>
            </p>
            <p>
              Resolved application: <span className="font-mono text-foreground">admin</span>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle>Application registry</CardTitle>
            <CardDescription>
              Resolved from environment configuration at {registry.domain}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <List className="border-0">
              {registry.applications.map((application) => (
                <ListItem key={application.key} className="px-0">
                  <ListItemContent>
                    <ListItemTitle className="font-mono">{application.host}</ListItemTitle>
                    <ListItemDescription>
                      {application.key} · roles: {application.roles.join(', ')}
                    </ListItemDescription>
                  </ListItemContent>
                  <Badge variant={application.enabled ? 'success' : 'default'}>
                    {application.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
