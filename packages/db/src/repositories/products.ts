import { PRODUCT_STATUSES, type ProductStatus } from '@repo/types'
import { and, count, desc, eq, ilike, inArray, ne } from 'drizzle-orm'

import { getDb } from '../client'
import { categories, productImages, products } from '../schema'

export interface ProductImageRecord {
  objectKey: string
  alt: string | null
}

export interface ProductListItem {
  id: string
  name: string
  slug: string
  description: string
  priceCents: number
  stock: number
  status: ProductStatus
  categoryId: string | null
  categoryName: string | null
  categorySlug: string | null
  createdAt: Date
  updatedAt: Date
  images: ProductImageRecord[]
}

export interface ProductInput {
  name: string
  slug: string
  description: string
  priceCents: number
  stock: number
  status: ProductStatus
  categoryId: string | null
}

export interface ListStoreProductsOptions {
  q?: string
  categorySlug?: string
  page?: number
  pageSize?: number
}

export interface ListAdminProductsOptions {
  q?: string
  status?: ProductStatus
  page?: number
  pageSize?: number
}

const productColumns = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  description: products.description,
  priceCents: products.priceCents,
  stock: products.stock,
  status: products.status,
  categoryId: products.categoryId,
  categoryName: categories.name,
  categorySlug: categories.slug,
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
}

type ProductRow = Omit<ProductListItem, 'images'>

async function attachImages(rows: ProductRow[]): Promise<ProductListItem[]> {
  if (rows.length === 0) return []

  const imageRows = await getDb()
    .select({
      productId: productImages.productId,
      objectKey: productImages.objectKey,
      alt: productImages.alt,
    })
    .from(productImages)
    .where(
      inArray(
        productImages.productId,
        rows.map((row) => row.id),
      ),
    )
    .orderBy(productImages.position, productImages.createdAt)

  const imagesByProduct = new Map<string, ProductImageRecord[]>()
  for (const image of imageRows) {
    const list = imagesByProduct.get(image.productId) ?? []
    list.push({ objectKey: image.objectKey, alt: image.alt })
    imagesByProduct.set(image.productId, list)
  }

  return rows.map((row) => ({ ...row, images: imagesByProduct.get(row.id) ?? [] }))
}

export async function listStoreProducts(
  options: ListStoreProductsOptions = {},
): Promise<{ items: ProductListItem[]; total: number }> {
  const db = getDb()
  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.min(48, Math.max(1, options.pageSize ?? 12))

  const filters = [eq(products.status, PRODUCT_STATUSES.ACTIVE)]
  if (options.q) filters.push(ilike(products.name, `%${options.q}%`))
  if (options.categorySlug) filters.push(eq(categories.slug, options.categorySlug))
  const where = and(...filters)

  const [rows, countRows] = await Promise.all([
    db
      .select(productColumns)
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ value: count() })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ])

  return { items: await attachImages(rows), total: countRows[0]?.value ?? 0 }
}

export async function listAdminProducts(
  options: ListAdminProductsOptions = {},
): Promise<{ items: ProductListItem[]; total: number }> {
  const db = getDb()
  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.min(48, Math.max(1, options.pageSize ?? 15))

  const filters = []
  if (options.q) filters.push(ilike(products.name, `%${options.q}%`))
  if (options.status) filters.push(eq(products.status, options.status))
  const where = filters.length > 0 ? and(...filters) : undefined

  const [rows, countRows] = await Promise.all([
    db
      .select(productColumns)
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(desc(products.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(products).where(where),
  ])

  return { items: await attachImages(rows), total: countRows[0]?.value ?? 0 }
}

export async function getProductBySlug(slug: string): Promise<ProductListItem | null> {
  const [row] = await getDb()
    .select(productColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.status, PRODUCT_STATUSES.ACTIVE)))
    .limit(1)

  if (!row) return null
  const [product] = await attachImages([row])
  return product ?? null
}

export async function getProductById(id: string): Promise<ProductListItem | null> {
  const [row] = await getDb()
    .select(productColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
    .limit(1)

  if (!row) return null
  const [product] = await attachImages([row])
  return product ?? null
}

export async function listRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
): Promise<ProductListItem[]> {
  const rows = await getDb()
    .select(productColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.status, PRODUCT_STATUSES.ACTIVE),
        eq(products.categoryId, categoryId),
        ne(products.id, excludeProductId),
      ),
    )
    .orderBy(desc(products.createdAt))
    .limit(limit)

  return attachImages(rows)
}

export async function createProduct(input: ProductInput, imageKeys: string[]): Promise<string> {
  const db = getDb()

  return db.transaction(async (tx) => {
    const [row] = await tx.insert(products).values(input).returning({ id: products.id })
    if (!row) throw new Error('Failed to create product')

    if (imageKeys.length > 0) {
      await tx
        .insert(productImages)
        .values(
          imageKeys.map((objectKey, position) => ({ productId: row.id, objectKey, position })),
        )
    }

    return row.id
  })
}

export async function updateProduct(
  id: string,
  input: ProductInput,
  imageKeys: string[],
): Promise<void> {
  const db = getDb()

  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(products.id, id))

    await tx.delete(productImages).where(eq(productImages.productId, id))

    if (imageKeys.length > 0) {
      await tx
        .insert(productImages)
        .values(imageKeys.map((objectKey, position) => ({ productId: id, objectKey, position })))
    }
  })
}

export async function deleteProduct(id: string): Promise<void> {
  await getDb().delete(products).where(eq(products.id, id))
}

export async function getProductImageKeys(productId: string): Promise<string[]> {
  const rows = await getDb()
    .select({ objectKey: productImages.objectKey })
    .from(productImages)
    .where(eq(productImages.productId, productId))

  return rows.map((row) => row.objectKey)
}

export async function countProducts(): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(products)
  return row?.value ?? 0
}

export async function countActiveProducts(): Promise<number> {
  const [row] = await getDb()
    .select({ value: count() })
    .from(products)
    .where(eq(products.status, PRODUCT_STATUSES.ACTIVE))

  return row?.value ?? 0
}
