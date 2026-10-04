import { getCurrentUser } from '@repo/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { safeRedirectPath } from '@repo/utils'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/features/auth/components/login-form'

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
    <div className="mx-auto flex min-h-[70vh] w-full max-w-site items-center justify-center px-6 py-16">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle as="h1" className="text-subhead">
            Welcome back
          </CardTitle>
          <CardDescription>Sign in to your account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <LoginForm next={next === '/dashboard' ? undefined : next} />
          <p className="text-small text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
