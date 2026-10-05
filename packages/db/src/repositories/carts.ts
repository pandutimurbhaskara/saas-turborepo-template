import { and, eq, inArray, sql } from 'drizzle-orm'

import { getDb } from '../client'
import { cartItems, carts, productImages, products } from '../schema'

export interface CartRecord {
  id: string
  userId: string | null
  sessionId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CartItemView {
  id: string
  productId: string
  name: string
  slug: string
  priceCents: number
  stock: number
  quantity: number
  imageKey: string | null
}

const cartColumns = {
  id: carts.id,
  userId: carts.userId,
  sessionId: carts.sessionId,
  createdAt: carts.createdAt,
  updatedAt: carts.updatedAt,
}

export async function getOrCreateCartForUser(userId: string): Promise<CartRecord> {
  const db = getDb()

  const [existing] = await db
    .select(cartColumns)
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1)
  if (existing) return existing

  const [created] = await db
    .insert(carts)
    .values({ userId })
    .onConflictDoNothing({ target: carts.userId })
    .returning(cartColumns)
  if (created) return created

  const [row] = await db.select(cartColumns).from(carts).where(eq(carts.userId, userId)).limit(1)
  if (!row) throw new Error('Failed to create cart')
  return row
}

export async function getOrCreateCartBySession(sessionId: string): Promise<CartRecord> {
  const db = getDb()

  const [existing] = await db
    .select(cartColumns)
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1)
  if (existing) return existing

  const [created] = await db
    .insert(carts)
    .values({ sessionId })
    .onConflictDoNothing({ target: carts.sessionId })
    .returning(cartColumns)
  if (created) return created

  const [row] = await db
    .select(cartColumns)
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1)
  if (!row) throw new Error('Failed to create cart')
  return row
}

export async function getCartBySession(sessionId: string): Promise<CartRecord | null> {
  const [row] = await getDb()
    .select(cartColumns)
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1)

  return row ?? null
}

export async function getCartByUser(userId: string): Promise<CartRecord | null> {
  const [row] = await getDb()
    .select(cartColumns)
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1)
  return row ?? null
}

export async function getCartItems(cartId: string): Promise<CartItemView[]> {
  const db = getDb()

  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      slug: products.slug,
      priceCents: products.priceCents,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(cartItems.createdAt)

  if (rows.length === 0) return []

  const imageRows = await db
    .select({ productId: productImages.productId, objectKey: productImages.objectKey })
    .from(productImages)
    .where(
      inArray(
        productImages.productId,
        rows.map((row) => row.productId),
      ),
    )
    .orderBy(productImages.position, productImages.createdAt)

  const firstImageByProduct = new Map<string, string>()
  for (const image of imageRows) {
    if (!firstImageByProduct.has(image.productId)) {
      firstImageByProduct.set(image.productId, image.objectKey)
    }
  }

  return rows.map((row) => ({ ...row, imageKey: firstImageByProduct.get(row.productId) ?? null }))
}

export async function getCartItem(
  cartId: string,
  productId: string,
): Promise<{ id: string; quantity: number } | null> {
  const [row] = await getDb()
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1)

  return row ?? null
}

export async function upsertCartItemQuantity(
  cartId: string,
  productId: string,
  quantity: number,
): Promise<void> {
  await getDb()
    .insert(cartItems)
    .values({ cartId, productId, quantity })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: { quantity, updatedAt: new Date() },
    })
}

export async function updateCartItemQuantity(
  cartId: string,
  cartItemId: string,
  quantity: number,
): Promise<void> {
  await getDb()
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.id, cartItemId)))
}

export async function removeCartItem(cartId: string, cartItemId: string): Promise<void> {
  await getDb()
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.id, cartItemId)))
}

export async function clearCartItems(cartId: string): Promise<void> {
  await getDb().delete(cartItems).where(eq(cartItems.cartId, cartId))
}

export async function mergeCarts(fromCartId: string, toCartId: string): Promise<void> {
  if (fromCartId === toCartId) return

  const db = getDb()

  await db.transaction(async (tx) => {
    const sourceItems = await tx
      .select({ productId: cartItems.productId, quantity: cartItems.quantity })
      .from(cartItems)
      .where(eq(cartItems.cartId, fromCartId))

    for (const item of sourceItems) {
      const [existing] = await tx
        .select({ id: cartItems.id, quantity: cartItems.quantity })
        .from(cartItems)
        .where(and(eq(cartItems.cartId, toCartId), eq(cartItems.productId, item.productId)))
        .limit(1)

      if (existing) {
        await tx
          .update(cartItems)
          .set({ quantity: existing.quantity + item.quantity, updatedAt: new Date() })
          .where(eq(cartItems.id, existing.id))
      } else {
        await tx
          .insert(cartItems)
          .values({ cartId: toCartId, productId: item.productId, quantity: item.quantity })
      }
    }

    await tx.delete(cartItems).where(eq(cartItems.cartId, fromCartId))
    await tx.delete(carts).where(eq(carts.id, fromCartId))
  })
}

export async function getCartItemCount(cartId: string): Promise<number> {
  const [row] = await getDb()
    .select({ value: sql<number>`coalesce(sum(${cartItems.quantity}), 0)`.mapWith(Number) })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId))

  return row?.value ?? 0
}
