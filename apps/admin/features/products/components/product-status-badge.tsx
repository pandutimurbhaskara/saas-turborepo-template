import type { ProductStatus } from '@repo/types'
import { Badge } from '@repo/ui'

const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
}

const PRODUCT_STATUS_VARIANTS: Record<ProductStatus, 'default' | 'success' | 'warning'> = {
  draft: 'default',
  active: 'success',
  archived: 'warning',
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <Badge variant={PRODUCT_STATUS_VARIANTS[status]}>{PRODUCT_STATUS_LABELS[status]}</Badge>
}
