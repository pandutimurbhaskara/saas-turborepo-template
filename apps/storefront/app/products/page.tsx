import { listCategories, listStoreProducts } from '@repo/db'
import { Button, buttonVariants, EmptyState, Input, Label, PageHeader } from '@repo/ui'
import { cn, formatNumber } from '@repo/utils'
import { PackageSearch } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ProductGrid } from '@/features/catalog/components/product-grid'

export const metadata: Metadata = {
  title: 'Products',
}

const PAGE_SIZE = 12

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const categorySlug = params.category?.trim() ?? ''
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)

  const [categories, { items, total }] = await Promise.all([
    listCategories(),
    listStoreProducts({
      q: q || undefined,
      categorySlug: categorySlug || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildHref(overrides: { category?: string; page?: number } = {}) {
    const search = new URLSearchParams()
    if (q) search.set('q', q)
    const nextCategory = overrides.category === undefined ? categorySlug : overrides.category
    if (nextCategory) search.set('category', nextCategory)
    const nextPage = overrides.page ?? page
    if (nextPage > 1) search.set('page', String(nextPage))
    const query = search.toString()
    return query ? `/products?${query}` : '/products'
  }

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Catalog"
        title="Products"
        description="Browse the full collection, filter by category or search for something specific."
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <form method="get" className="flex items-end gap-3">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="q">Search</Label>
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              className="w-64"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Button variant={!categorySlug ? 'primary' : 'secondary'} size="sm" asChild>
            <Link href={buildHref({ category: '' })}>All</Link>
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={categorySlug === category.slug ? 'primary' : 'secondary'}
              size="sm"
              asChild
            >
              <Link href={buildHref({ category: category.slug })}>{category.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description="Try a different search term or clear the filters."
          action={
            <Button variant="secondary" asChild>
              <Link href="/products">Clear filters</Link>
            </Button>
          }
        />
      ) : (
        <ProductGrid products={items} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-small text-muted-foreground">
            {formatNumber(total)} product{total === 1 ? '' : 's'} · page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={buildHref({ page: page - 1 })}
              aria-disabled={page <= 1}
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'sm' }),
                page <= 1 && 'pointer-events-none opacity-50',
              )}
            >
              Previous
            </Link>
            <Link
              href={buildHref({ page: page + 1 })}
              aria-disabled={page >= totalPages}
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'sm' }),
                page >= totalPages && 'pointer-events-none opacity-50',
              )}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
