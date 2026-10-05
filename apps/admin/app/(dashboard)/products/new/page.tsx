import { requireApplicationAccess } from '@repo/auth'
import { listCategories } from '@repo/db'
import { PageHeader } from '@repo/ui'
import type { Metadata } from 'next'

import { ProductForm } from '@/features/products/components/product-form'

export const metadata: Metadata = {
  title: 'New product',
}

export default async function NewProductPage() {
  await requireApplicationAccess('admin', { loginPath: '/login', forbiddenPath: '/forbidden' })

  const categories = await listCategories()

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Catalog"
        title="New product"
        description="Create a product and upload its images to object storage."
      />
      <div className="max-w-3xl">
        <ProductForm
          mode="create"
          categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        />
      </div>
    </div>
  )
}
