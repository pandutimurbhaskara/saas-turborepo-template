import { requireApplicationAccess } from '@repo/auth'
import { listAdminProducts } from '@repo/db'
import { getPublicUrl } from '@repo/storage'
import { PRODUCT_STATUSES, type ProductStatus } from '@repo/types'
import {
  Badge,
  Button,
  buttonVariants,
  EmptyState,
  Input,
  Label,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { cn, formatCurrency, formatDate, formatNumber } from '@repo/utils'
import { Package } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ProductStatusBadge } from '@/features/products/components/product-status-badge'

export const metadata: Metadata = {
  title: 'Products',
}

const PAGE_SIZE = 15

const STATUS_FILTERS: Array<{ label: string; value: ProductStatus | null }> = [
  { label: 'All', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  await requireApplicationAccess('admin', { loginPath: '/login', forbiddenPath: '/forbidden' })

  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const status = (Object.values(PRODUCT_STATUSES) as string[]).includes(params.status ?? '')
    ? (params.status as ProductStatus)
    : undefined
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)

  const { items, total } = await listAdminProducts({
    q: q || undefined,
    status,
    page,
    pageSize: PAGE_SIZE,
  })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildHref(overrides: { status?: string; page?: number } = {}) {
    const search = new URLSearchParams()
    if (q) search.set('q', q)
    const nextStatus = overrides.status === undefined ? (status ?? '') : overrides.status
    if (nextStatus) search.set('status', nextStatus)
    const nextPage = overrides.page ?? page
    if (nextPage > 1) search.set('page', String(nextPage))
    const query = search.toString()
    return query ? `/products?${query}` : '/products'
  }

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Catalog"
        title="Products"
        description="Create, edit and retire products. Images are stored in S3-compatible object storage."
        actions={
          <Button asChild>
            <Link href="/products/new">New product</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <form method="get" className="flex items-end gap-3">
          {status && <input type="hidden" name="status" value={status} />}
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
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.label}
              variant={(status ?? null) === filter.value ? 'primary' : 'secondary'}
              size="sm"
              asChild
            >
              <Link href={buildHref({ status: filter.value ?? '' })}>{filter.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            q || status
              ? 'Try clearing the search or status filters.'
              : 'Create your first product to populate the storefront.'
          }
          action={
            <Button asChild>
              <Link href="/products/new">New product</Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-subtle">
                      {product.images[0] ? (
                        <Image
                          src={getPublicUrl(product.images[0].objectKey)}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="size-4 text-subtle-foreground" />
                      )}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-small text-muted-foreground">{product.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.categoryName ?? '—'}
                </TableCell>
                <TableCell>{formatCurrency(product.priceCents)}</TableCell>
                <TableCell>
                  {product.stock === 0 ? (
                    <Badge variant="warning">Out of stock</Badge>
                  ) : (
                    formatNumber(product.stock)
                  )}
                </TableCell>
                <TableCell>
                  <ProductStatusBadge status={product.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(product.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/products/${product.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
    </div>
  )
}
