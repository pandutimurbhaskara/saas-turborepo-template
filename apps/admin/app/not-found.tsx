import { Button, ErrorState } from '@repo/ui'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-site px-6 py-24">
      <ErrorState
        status="404"
        title="Page not found"
        description="The admin page you are looking for does not exist or has been moved."
        actions={
          <Button variant="secondary" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
