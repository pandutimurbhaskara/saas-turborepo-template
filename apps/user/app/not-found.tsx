import { Button } from '@repo/ui'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-site flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="text-overline uppercase text-primary">404</p>
      <h1 className="font-display text-heading tracking-[-0.03em]">Page not found</h1>
      <p className="max-w-md text-ui text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button className="mt-2" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  )
}
