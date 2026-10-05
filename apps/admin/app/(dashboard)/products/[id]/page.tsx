import { requireApplicationAccess } from '@repo/auth'
import { getProductById, listCategories } from '@repo/db'
import { getPublicUrl } from '@repo/storage'
import { PageHeader } from '@repo/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DeleteProductButton } from '@/features/products/components/delete-product-button'
import { ProductForm } from '@/features/products/components/product-form'

export const metadata: Metadata = {
  title: 'Edit product',
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireApplicationAccess('admin', { loginPath: '/login', forbiddenPath: '/forbidden' })

  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const categories = await listCategories()

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Catalog"
        title={product.name}
        description={`Storefront path: /products/${product.slug}`}
        actions={<DeleteProductButton productId={product.id} productName={product.name} />}
      />
      <div className="max-w-3xl">
        <ProductForm
          mode="edit"
          categories={categories.map((category) => ({ id: category.id, name: category.name }))}
          defaultValues={{
            productId: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            priceCents: product.priceCents,
            stock: product.stock,
            status: product.status,
            categoryId: product.categoryId,
            images: product.images.map((image) => ({
              key: image.objectKey,
              url: getPublicUrl(image.objectKey),
            })),
          }}
        />
      </div>
    </div>
  )
}
