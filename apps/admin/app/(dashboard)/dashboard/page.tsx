import { getSession, requireApplicationAccess } from '@repo/auth'
import { countPermissions, countRoles, countUsers } from '@repo/db'
import { getApplicationRegistry } from '@repo/domain'
import {
  Badge,
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
import { formatNumber, formatRelativeTime } from '@repo/utils'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function AdminDashboardPage() {
  await requireApplicationAccess('admin', { loginPath: '/login', forbiddenPath: '/forbidden' })

  const [userCount, roleCount, permissionCount] = await Promise.all([
    countUsers(),
    countRoles(),
    countPermissions(),
  ])

  const session = await getSession()
  const requestHeaders = await headers()
  const host = requestHeaders.get('host') ?? 'unknown'
  const registry = getApplicationRegistry()

  const stats = [
    { label: 'Users', value: userCount },
    { label: 'Roles', value: roleCount },
    { label: 'Permissions', value: permissionCount },
  ]

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Dashboard"
        title="Administration overview"
        description="Server-rendered figures straight from PostgreSQL through the shared database package."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription className="text-overline uppercase">{stat.label}</CardDescription>
              <p className="font-display text-4xl font-bold tracking-[-0.03em]">
                {formatNumber(stat.value)}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>

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
