import { getProductBySlug, listRelatedProducts } from '@repo/db'
import { getPublicUrl } from '@repo/storage'
import { Badge } from '@repo/ui'
import { formatCurrency } from '@repo/utils'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AddToCartForm } from '@/features/catalog/components/add-to-cart-form'
import { ProductGallery } from '@/features/catalog/components/product-gallery'
import { ProductGrid } from '@/features/catalog/components/product-grid'

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  return { title: product?.name ?? 'Product not found' }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = product.categoryId
    ? await listRelatedProducts(product.categoryId, product.id)
    : []

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-12 px-6 py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          name={product.name}
          images={product.images.map((image) => ({
            url: getPublicUrl(image.objectKey),
            alt: image.alt,
          }))}
        />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {product.categorySlug && product.categoryName && (
              <Link
                href={`/products?category=${product.categorySlug}`}
                className="text-overline uppercase text-primary hover:underline"
              >
                {product.categoryName}
              </Link>
            )}
            <h1 className="text-heading">{product.name}</h1>
            <p className="font-display text-subhead font-semibold">
              {formatCurrency(product.priceCents)}
            </p>
            {product.stock === 0 && (
              <Badge variant="warning" className="w-fit">
                Out of stock
              </Badge>
            )}
          </div>

          <AddToCartForm productId={product.id} stock={product.stock} />

          {product.description && (
            <div className="border-t border-border pt-6">
              <p className="whitespace-pre-line text-ui text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-border pt-12">
          <h2 className="text-subhead">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
