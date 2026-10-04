import { getCurrentUser } from '@repo/auth'
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CodeBlock,
  InlineCode,
} from '@repo/ui'
import { Database, Globe, KeyRound, Palette, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { DotGrid } from '@/components/dot-grid'

export const metadata: Metadata = {
  title: 'A foundation for multi-application products',
}

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: Globe,
    title: 'Hostname isolation',
    description:
      'Every application resolves from its host through a shared registry. No client-side hostname logic, ever.',
  },
  {
    icon: Palette,
    title: 'Shared design system',
    description:
      'Design tokens and primitives live in @repo/ui so applications stay visually consistent without duplication.',
  },
  {
    icon: KeyRound,
    title: 'Authentication',
    description:
      'Session-based credentials authentication behind a replaceable abstraction in @repo/auth.',
  },
  {
    icon: ShieldCheck,
    title: 'Authorization',
    description:
      'Roles and permissions are enforced on the server through centralized application access rules.',
  },
  {
    icon: Database,
    title: 'Type-safe database',
    description:
      'PostgreSQL with Drizzle ORM, migrations and seed scripts, domain-neutral by design.',
  },
  {
    icon: Workflow,
    title: 'CI and testing',
    description:
      'Vitest unit tests, Playwright end-to-end coverage and a GitHub Actions pipeline wired up from day one.',
  },
]

const HOST_MAPPING = `example.com          →  apps/user
admin.example.com    →  apps/admin
seller.example.com   →  apps/seller   (future)`

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid />
        <div className="relative mx-auto flex max-w-site flex-col items-start gap-6 px-6 py-24 sm:py-32">
          <p className="text-overline uppercase text-primary">Turborepo + Next.js boilerplate</p>
          <h1 className="max-w-3xl text-headline sm:text-display">
            Ship multi-app products from a single codebase.
          </h1>
          <p className="max-w-2xl text-body text-muted-foreground">
            A reusable foundation where every application is isolated by hostname while sharing
            authentication, design tokens, database infrastructure and deployment tooling.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register">Create account</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-site flex-col gap-3 px-6 py-16">
          <p className="text-overline uppercase text-subtle-foreground">Design system</p>
          <p className="max-w-3xl font-display text-subhead">
            Every surface is generated from a single source of truth —{' '}
            <span className="font-semibold text-secondary">DESIGN.md</span> — expressed as reusable
            tokens inside <InlineCode>@repo/ui</InlineCode>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-site px-6 py-16 sm:py-24">
        <div className="flex flex-col gap-3">
          <p className="text-overline uppercase text-primary">Architecture</p>
          <h2 className="max-w-2xl text-heading">Everything a multi-application foundation needs</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} interactive>
              <CardHeader>
                <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-4" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-site gap-10 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            <p className="text-overline uppercase text-primary">Application isolation</p>
            <h2 className="text-heading">One repository, independent deployments</h2>
            <p className="max-w-xl text-ui text-muted-foreground">
              Each hostname resolves to its own Next.js application through the shared domain
              resolver. Applications deploy separately on Vercel while reusing the same packages —
              adding <InlineCode>apps/seller</InlineCode> is a configuration change, not a rewrite.
            </p>
          </div>
          <CodeBlock>{HOST_MAPPING}</CodeBlock>
        </div>
      </section>
    </>
  )
}
