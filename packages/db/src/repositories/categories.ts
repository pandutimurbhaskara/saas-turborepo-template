import { asc, count, eq } from 'drizzle-orm'

import { getDb } from '../client'
import { categories, products } from '../schema'

export interface CategoryRecord {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CategoryWithCount extends Omit<CategoryRecord, 'createdAt' | 'updatedAt'> {
  productCount: number
}

const categoryColumns = {
  id: categories.id,
  name: categories.name,
  slug: categories.slug,
  description: categories.description,
  createdAt: categories.createdAt,
  updatedAt: categories.updatedAt,
}

export async function listCategories(): Promise<CategoryRecord[]> {
  return getDb().select(categoryColumns).from(categories).orderBy(asc(categories.name))
}

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const rows = await getDb()
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id, categories.name, categories.slug, categories.description)
    .orderBy(asc(categories.name))

  return rows
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRecord | null> {
  const [row] = await getDb()
    .select(categoryColumns)
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1)

  return row ?? null
}

export async function getCategoryById(id: string): Promise<CategoryRecord | null> {
  const [row] = await getDb()
    .select(categoryColumns)
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)

  return row ?? null
}

export async function createCategory(input: {
  name: string
  slug: string
}): Promise<CategoryRecord> {
  const [row] = await getDb()
    .insert(categories)
    .values({ name: input.name, slug: input.slug })
    .returning(categoryColumns)

  if (!row) throw new Error('Failed to create category')
  return row
}

export async function deleteCategory(id: string): Promise<void> {
  await getDb().delete(categories).where(eq(categories.id, id))
}

export async function countCategories(): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(categories)
  return row?.value ?? 0
}
