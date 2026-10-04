import { requireAuth } from '@repo/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from '@repo/ui'
import type { Metadata } from 'next'

import { ProfileForm } from '@/features/profile/components/profile-form'

export const metadata: Metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const user = await requireAuth({ loginPath: '/login' })

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Profile"
        title="Your profile"
        description="Updates are written with a server action and persisted to PostgreSQL."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>This information is visible to you across applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm defaultName={user.name ?? ''} email={user.email} />
        </CardContent>
      </Card>
    </div>
  )
}
