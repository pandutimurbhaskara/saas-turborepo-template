import type { ProductListItem } from '@repo/db'

import { ProductCard } from '@/features/catalog/components/product-card'

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  return (
    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
