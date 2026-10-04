import { getSession, requireAuth } from '@repo/auth'
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from '@repo/ui'
import { formatDate, formatRelativeTime } from '@repo/utils'
import { headers } from 'next/headers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const user = await requireAuth({ loginPath: '/login' })
  const session = await getSession()
  const requestHeaders = await headers()
  const host = requestHeaders.get('host') ?? 'unknown'

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Dashboard"
        title={`Welcome back, ${user.name?.split(' ')[0] ?? 'there'}`}
        description="This dashboard proves authentication, sessions, the shared layout and server-side authorization are wired up."
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
          <CardContent className="flex flex-col gap-2 text-small text-muted-foreground">
            <p>Member since {formatDate(user.createdAt)}</p>
            <p>Roles are loaded from the database on every request.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Server-validated, database-backed session.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-small text-muted-foreground">
            <p>Expires {session ? formatRelativeTime(session.session.expiresAt) : 'unknown'}</p>
            <p>
              Served by <span className="font-mono text-foreground">{host}</span>
            </p>
            <p>
              Resolved application: <span className="font-mono text-foreground">user</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles &amp; permissions</CardTitle>
            <CardDescription>Enforced on the server for every request.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge key={role} variant="primary">
                  {role}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {user.permissions.slice(0, 6).map((permission) => (
                <Badge key={permission}>{permission}</Badge>
              ))}
              {user.permissions.length > 6 && <Badge>+{user.permissions.length - 6} more</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
