import { requireAuth } from '@repo/auth'
import { getUserPreferences } from '@repo/db'
import { DEFAULT_USER_PREFERENCES } from '@repo/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from '@repo/ui'
import type { Metadata } from 'next'

import { PreferencesForm } from '@/features/settings/components/preferences-form'
import { ThemePreference } from '@/features/settings/components/theme-preference'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const user = await requireAuth({ loginPath: '/login' })
  const preferences = (await getUserPreferences(user.id)) ?? DEFAULT_USER_PREFERENCES

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Settings"
        title="Preferences"
        description="Theme is applied client-side; notification preferences persist to the database."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Light, dark or following your system preference.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemePreference />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Stored as a JSON column on the user record.</CardDescription>
          </CardHeader>
          <CardContent>
            <PreferencesForm preferences={preferences} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
