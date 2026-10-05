import { listCategories, listStoreProducts } from '@repo/db'
import { Button, Card, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { HeartHandshake, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { DotGrid } from '@/components/dot-grid'
import { ProductGrid } from '@/features/catalog/components/product-grid'
import { APP_NAME } from '@/lib/app'

export const metadata: Metadata = {
  title: 'Everyday essentials, thoughtfully made',
}

interface ValueProp {
  icon: LucideIcon
  title: string
  description: string
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: Truck,
    title: 'Free shipping over $75',
    description: 'Orders leave our warehouse within one business day, anywhere in the country.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure checkout',
    description: 'Server-validated carts and orders — prices and stock are always checked on save.',
  },
  {
    icon: HeartHandshake,
    title: 'Easy returns',
    description: 'Thirty days to change your mind, no questions asked.',
  },
]

export default async function HomePage() {
  const [{ items: featured }, categories] = await Promise.all([
    listStoreProducts({ pageSize: 8 }),
    listCategories(),
  ])

  const firstCategory = categories[0]

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid />
        <div className="relative mx-auto flex max-w-site flex-col items-start gap-6 px-6 py-24 sm:py-32">
          <p className="text-overline uppercase text-primary">{APP_NAME}</p>
          <h1 className="max-w-3xl text-headline sm:text-display">
            Everyday essentials, thoughtfully made.
          </h1>
          <p className="max-w-2xl text-body text-muted-foreground">
            Thoughtfully sourced apparel, accessories and home goods — with a checkout that takes
            seconds and order tracking built in.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/products">Shop all products</Link>
            </Button>
            {firstCategory && (
              <Button size="lg" variant="secondary" asChild>
                <Link href={`/products?category=${firstCategory.slug}`}>
                  Browse {firstCategory.name}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-site flex-wrap items-center gap-3 px-6 py-6">
            <p className="text-overline uppercase text-subtle-foreground">Collections</p>
            {categories.map((category) => (
              <Button key={category.id} variant="secondary" size="sm" asChild>
                <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto flex w-full max-w-site flex-col gap-8 px-6 py-16 sm:py-20">
        <div className="flex flex-col gap-2">
          <p className="text-overline uppercase text-primary">Featured</p>
          <h2 className="text-heading">New arrivals</h2>
        </div>
        {featured.length === 0 ? (
          <p className="text-ui text-muted-foreground">
            Products will appear here once the catalog is populated.
          </p>
        ) : (
          <ProductGrid products={featured} />
        )}
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-site gap-5 px-6 py-16 sm:grid-cols-3">
          {VALUE_PROPS.map((prop) => (
            <Card key={prop.title}>
              <CardHeader>
                <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <prop.icon className="size-4" />
                </span>
                <CardTitle>{prop.title}</CardTitle>
                <CardDescription>{prop.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
