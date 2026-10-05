'use server'

import { requirePermission } from '@repo/auth'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductImageKeys,
  updateProduct,
  type ProductInput,
} from '@repo/db'
import {
  buildProductImageKey,
  createPresignedUploadUrl,
  deleteObjects,
  getPublicUrl,
  isSupportedImageMimeType,
} from '@repo/storage'
import {
  INITIAL_FORM_STATE,
  MAX_PRODUCT_IMAGES,
  PERMISSIONS,
  PRODUCT_STATUSES,
  type FormState,
  type ProductStatus,
} from '@repo/types'
import { parsePriceToCents, slugify } from '@repo/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const GUARD_OPTIONS = { loginPath: '/login', forbiddenPath: '/forbidden' }

export type UploadUrlResult =
  { ok: true; key: string; uploadUrl: string; publicUrl: string } | { ok: false; message: string }

export async function createUploadUrlAction(contentType: string): Promise<UploadUrlResult> {
  await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, GUARD_OPTIONS)

  if (!isSupportedImageMimeType(contentType)) {
    return { ok: false, message: `Unsupported image type: ${contentType || 'unknown'}.` }
  }

  const key = buildProductImageKey(contentType)
  const uploadUrl = await createPresignedUploadUrl({ key, contentType })

  return { ok: true, key, uploadUrl, publicUrl: getPublicUrl(key) }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  )
}

function parseProductForm(
  formData: FormData,
): { input: ProductInput; imageKeys: string[] } | { error: string } {
  const name = String(formData.get('name') ?? '').trim()
  if (name.length < 1 || name.length > 200) {
    return { error: 'Enter a product name between 1 and 200 characters.' }
  }

  const rawSlug = String(formData.get('slug') ?? '').trim()
  const slug = slugify(rawSlug || name)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: 'Enter a valid slug (lowercase letters, numbers and hyphens).' }
  }

  const description = String(formData.get('description') ?? '').trim()
  if (description.length > 5000) {
    return { error: 'Keep the description under 5000 characters.' }
  }

  const priceCents = parsePriceToCents(String(formData.get('price') ?? ''))
  if (priceCents === null) {
    return { error: 'Enter a price like 19.99.' }
  }

  const stock = Number(String(formData.get('stock') ?? '').trim())
  if (!Number.isInteger(stock) || stock < 0) {
    return { error: 'Stock must be a whole number of zero or more.' }
  }

  const status = String(formData.get('status') ?? '')
  const statuses = Object.values(PRODUCT_STATUSES) as string[]
  if (!statuses.includes(status)) {
    return { error: 'Choose a valid product status.' }
  }

  const rawCategoryId = String(formData.get('categoryId') ?? '')
  const categoryId = rawCategoryId && rawCategoryId !== 'none' ? rawCategoryId : null

  const imageKeys = formData
    .getAll('imageKeys')
    .map((value) => String(value))
    .filter(Boolean)
  if (imageKeys.length > MAX_PRODUCT_IMAGES) {
    return { error: `Upload at most ${MAX_PRODUCT_IMAGES} images.` }
  }

  return {
    input: {
      name,
      slug,
      description,
      priceCents,
      stock,
      status: status as ProductStatus,
      categoryId,
    },
    imageKeys,
  }
}

export async function createProductAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, GUARD_OPTIONS)

  const parsed = parseProductForm(formData)
  if ('error' in parsed) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: parsed.error }
  }

  try {
    await createProduct(parsed.input, parsed.imageKeys)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ...INITIAL_FORM_STATE,
        status: 'error',
        message: 'A product with this slug already exists.',
      }
    }
    throw error
  }

  revalidatePath('/products')
  redirect('/products')
}

export async function updateProductAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, GUARD_OPTIONS)

  const productId = String(formData.get('productId') ?? '')
  if (!productId) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: 'Product not found.' }
  }

  const existing = await getProductById(productId)
  if (!existing) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: 'Product not found.' }
  }

  const parsed = parseProductForm(formData)
  if ('error' in parsed) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: parsed.error }
  }

  try {
    await updateProduct(productId, parsed.input, parsed.imageKeys)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ...INITIAL_FORM_STATE,
        status: 'error',
        message: 'A product with this slug already exists.',
      }
    }
    throw error
  }

  const removedKeys = existing.images
    .map((image) => image.objectKey)
    .filter((key) => !parsed.imageKeys.includes(key))
  if (removedKeys.length > 0) {
    try {
      await deleteObjects(removedKeys)
    } catch {
      // Best-effort cleanup; the product images are already updated.
    }
  }

  revalidatePath('/products')
  revalidatePath(`/products/${productId}`)

  return { ...INITIAL_FORM_STATE, status: 'success', message: 'Product updated.' }
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, GUARD_OPTIONS)

  const productId = String(formData.get('productId') ?? '')
  if (!productId) return

  const imageKeys = await getProductImageKeys(productId)
  await deleteProduct(productId)

  if (imageKeys.length > 0) {
    try {
      await deleteObjects(imageKeys)
    } catch {
      // Best-effort cleanup; the product is already deleted.
    }
  }

  revalidatePath('/products')
  redirect('/products')
}
