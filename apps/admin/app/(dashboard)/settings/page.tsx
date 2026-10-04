import { requireApplicationAccess } from '@repo/auth'
import { getApplicationRegistry, RESERVED_SUBDOMAINS } from '@repo/domain'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from '@repo/ui'
import type { Metadata } from 'next'

import { ProfileForm } from '@/features/profile/components/profile-form'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function AdminSettingsPage() {
  const user = await requireApplicationAccess('admin', {
    loginPath: '/login',
    forbiddenPath: '/forbidden',
  })

  const registry = getApplicationRegistry()

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Settings"
        title="Console settings"
        description="Administrator identity plus a live view of the centralized application configuration."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Administrator profile</CardTitle>
            <CardDescription>Persisted with a server action to PostgreSQL.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm defaultName={user.name ?? ''} email={user.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application registry</CardTitle>
            <CardDescription>Defined once in @repo/domain, driven by environment URLs.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {registry.applications.map((application) => (
              <div key={application.key} className="flex flex-col gap-1.5 rounded-lg border border-border p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-small text-foreground">{application.host}</p>
                  <Badge variant={application.enabled ? 'success' : 'default'}>
                    {application.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {application.roles.map((role) => (
                    <Badge key={role}>{role}</Badge>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <p className="text-overline uppercase text-subtle-foreground">Reserved subdomains</p>
              <div className="flex flex-wrap gap-1.5">
                {RESERVED_SUBDOMAINS.map((subdomain) => (
                  <Badge key={subdomain}>{subdomain}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
