import { getCurrentUser } from '@repo/auth'
import { Brand, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { safeRedirectPath } from '@repo/utils'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/features/auth/components/login-form'
import { APP_NAME, APP_SECONDARY } from '@/lib/app'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const next = safeRedirectPath(typeof params.next === 'string' ? params.next : null, '/dashboard')

  const user = await getCurrentUser()
  if (user) redirect(next)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-site flex-col items-center justify-center gap-8 px-6 py-16">
      <Brand name={APP_NAME} secondary={APP_SECONDARY} />
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle className="text-subhead">Sign in to the console</CardTitle>
          <CardDescription>
            Only accounts with the ADMIN role can access this application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next === '/dashboard' ? undefined : next} />
        </CardContent>
      </Card>
      <p className="max-w-sm text-center text-caption text-subtle-foreground">
        Admin accounts are created by the seed script in development, or provisioned by your own
        onboarding flow in production.
      </p>
    </div>
  )
}
