import { getApplicationUrl } from '@repo/domain'
import { Brand, Button, ErrorState } from '@repo/ui'
import type { Metadata } from 'next'

import { signOutAction } from '@/lib/actions'
import { APP_NAME, APP_SECONDARY } from '@/lib/app'

export const metadata: Metadata = {
  title: 'Access denied',
}

export default function ForbiddenPage() {
  const userAppUrl = getApplicationUrl('user')

  return (
    <div className="mx-auto flex min-h-dvh max-w-site flex-col px-6">
      <header className="flex h-14 items-center border-b border-border">
        <Brand name={APP_NAME} secondary={APP_SECONDARY} />
      </header>
      <div className="flex flex-1 items-center justify-center py-16">
        <ErrorState
          status="Error 403"
          title="Access denied"
          description="Your account does not have permission to access the admin application. Admin access requires the ADMIN role."
          actions={
            <>
              {userAppUrl && (
                <Button asChild>
                  <a href={userAppUrl}>Go to the user app</a>
                </Button>
              )}
              <form action={signOutAction}>
                <Button type="submit" variant="secondary">
                  Sign out
                </Button>
              </form>
            </>
          }
        />
      </div>
      <footer className="border-t border-border py-6">
        <p className="text-caption text-subtle-foreground">
          Signed in accounts without the ADMIN role are rejected on the server.
        </p>
      </footer>
    </div>
  )
}
