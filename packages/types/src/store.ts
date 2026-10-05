export const PRODUCT_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

export type ProductStatus = (typeof PRODUCT_STATUSES)[keyof typeof PRODUCT_STATUSES]

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]

export const PRODUCT_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export type ProductImageMimeType = (typeof PRODUCT_IMAGE_MIME_TYPES)[number]

export const MAX_PRODUCT_IMAGES = 6

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024

export const CART_COOKIE_NAME = 'store_cart'

export const STORE_CURRENCY = 'USD'

export interface OrderAddress {
  fullName: string
  email: string
  phone?: string
  line1: string
  line2?: string
  city: string
  region?: string
  postalCode: string
  country: string
}
