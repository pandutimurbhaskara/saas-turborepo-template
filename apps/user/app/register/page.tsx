import { getCurrentUser } from '@repo/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata: Metadata = {
  title: 'Create account',
}

export default async function RegisterPage() {
  const user = await getCurrentUser()
  if (user) redirect('/dashboard')

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-site items-center justify-center px-6 py-16">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle as="h1" className="text-subhead">
            Create your account
          </CardTitle>
          <CardDescription>Start with the user role — roles are managed server-side.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RegisterForm />
          <p className="text-small text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
