import type { ProductListItem } from '@repo/db'
import { getPublicUrl } from '@repo/storage'
import { Badge } from '@repo/ui'
import { formatCurrency } from '@repo/utils'
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function ProductCard({ product }: { product: ProductListItem }) {
  const image = product.images[0]

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-subtle">
        {image ? (
          <Image
            src={getPublicUrl(image.objectKey)}
            alt={image.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-subtle-foreground">
            <ImageIcon className="size-6" />
          </span>
        )}
        {product.stock === 0 && (
          <Badge variant="warning" className="absolute left-3 top-3">
            Out of stock
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {product.categoryName && (
          <p className="text-overline uppercase text-subtle-foreground">{product.categoryName}</p>
        )}
        <p className="font-medium">{product.name}</p>
        <p className="text-ui text-muted-foreground">{formatCurrency(product.priceCents)}</p>
      </div>
    </Link>
  )
}
