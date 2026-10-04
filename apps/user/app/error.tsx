'use client'

import { Button, ErrorState } from '@repo/ui'
import Link from 'next/link'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-site px-6 py-12">
      <ErrorState
        status="Error"
        title="Something went wrong"
        description="An unexpected error occurred while rendering this page. You can try again or head back home."
        actions={
          <>
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant="secondary" asChild>
              <Link href="/">Back home</Link>
            </Button>
          </>
        }
      />
    </div>
  )
}
