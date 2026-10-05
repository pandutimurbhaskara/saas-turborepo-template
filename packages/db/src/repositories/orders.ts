import { ORDER_STATUSES, type OrderAddress, type OrderStatus } from '@repo/types'
import { generateOrderNumber } from '@repo/utils'
import { and, count, desc, eq, gte, ne, sql } from 'drizzle-orm'

import { getDb } from '../client'
import { cartItems, orderItems, orders, products, users } from '../schema'

export class InsufficientStockError extends Error {
  readonly productId: string

  constructor(productId: string) {
    super('One or more items are no longer available in the requested quantity.')
    this.name = 'InsufficientStockError'
    this.productId = productId
  }
}

export interface OrderItemSnapshot {
  productId: string
  name: string
  priceCents: number
  quantity: number
  imageKey: string | null
}

export interface PlaceOrderInput {
  userId: string
  email: string
  shippingAddress: OrderAddress
  items: OrderItemSnapshot[]
  cartId: string
}

export interface OrderSummary {
  id: string
  orderNumber: string
  email: string
  status: OrderStatus
  subtotalCents: number
  totalCents: number
  createdAt: Date
  itemCount: number
}

export interface AdminOrderSummary extends OrderSummary {
  customerName: string | null
}

export interface OrderItemRecord {
  id: string
  name: string
  priceCents: number
  quantity: number
  imageKey: string | null
}

export interface OrderDetail {
  id: string
  orderNumber: string
  userId: string
  email: string
  status: OrderStatus
  subtotalCents: number
  totalCents: number
  shippingAddress: OrderAddress
  createdAt: Date
  updatedAt: Date
  customerName: string | null
  items: OrderItemRecord[]
}

const itemCountSql =
  sql<number>`(select coalesce(sum(${orderItems.quantity}), 0) from ${orderItems} where ${orderItems.orderId} = ${orders.id})`.mapWith(
    Number,
  )

const orderSummaryColumns = {
  id: orders.id,
  orderNumber: orders.orderNumber,
  email: orders.email,
  status: orders.status,
  subtotalCents: orders.subtotalCents,
  totalCents: orders.totalCents,
  createdAt: orders.createdAt,
  itemCount: itemCountSql,
}

const orderItemColumns = {
  id: orderItems.id,
  name: orderItems.name,
  priceCents: orderItems.priceCents,
  quantity: orderItems.quantity,
  imageKey: orderItems.imageKey,
}

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<{ id: string; orderNumber: string }> {
  const db = getDb()

  return db.transaction(async (tx) => {
    let subtotalCents = 0

    for (const item of input.items) {
      const updated = await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.quantity}`, updatedAt: new Date() })
        .where(and(eq(products.id, item.productId), gte(products.stock, item.quantity)))
        .returning({ id: products.id })

      if (updated.length === 0) throw new InsufficientStockError(item.productId)

      subtotalCents += item.priceCents * item.quantity
    }

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId: input.userId,
        email: input.email,
        status: ORDER_STATUSES.PENDING,
        subtotalCents,
        totalCents: subtotalCents,
        shippingAddress: input.shippingAddress,
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber })

    if (!order) throw new Error('Failed to create order')

    if (input.items.length > 0) {
      await tx.insert(orderItems).values(
        input.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity,
          imageKey: item.imageKey,
        })),
      )
    }

    await tx.delete(cartItems).where(eq(cartItems.cartId, input.cartId))

    return order
  })
}

export async function listOrdersForUser(userId: string): Promise<OrderSummary[]> {
  return getDb()
    .select(orderSummaryColumns)
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
}

export async function getOrderByNumberForUser(
  orderNumber: string,
  userId: string,
): Promise<{
  order: OrderSummary & { shippingAddress: OrderAddress }
  items: OrderItemRecord[]
} | null> {
  const db = getDb()

  const [order] = await db
    .select({ ...orderSummaryColumns, shippingAddress: orders.shippingAddress })
    .from(orders)
    .where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId)))
    .limit(1)

  if (!order) return null

  const items = await db
    .select(orderItemColumns)
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))

  return { order, items }
}

export async function listOrdersAdmin(
  options: { status?: OrderStatus; page?: number; pageSize?: number } = {},
): Promise<{ items: AdminOrderSummary[]; total: number }> {
  const db = getDb()
  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 15))
  const where = options.status ? eq(orders.status, options.status) : undefined

  const [items, countRows] = await Promise.all([
    db
      .select({ ...orderSummaryColumns, customerName: users.name })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(orders).where(where),
  ])

  return { items, total: countRows[0]?.value ?? 0 }
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const db = getDb()

  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      userId: orders.userId,
      email: orders.email,
      status: orders.status,
      subtotalCents: orders.subtotalCents,
      totalCents: orders.totalCents,
      shippingAddress: orders.shippingAddress,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      customerName: users.name,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1)

  if (!order) return null

  const items = await db.select(orderItemColumns).from(orderItems).where(eq(orderItems.orderId, id))

  return { ...order, items }
}

export async function listRecentOrders(limit = 5): Promise<AdminOrderSummary[]> {
  return getDb()
    .select({ ...orderSummaryColumns, customerName: users.name })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const db = getDb()

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!existing) return false

    if (status === ORDER_STATUSES.CANCELLED && existing.status !== ORDER_STATUSES.CANCELLED) {
      const items = await tx
        .select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId))

      for (const item of items) {
        if (!item.productId) continue
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}`, updatedAt: new Date() })
          .where(eq(products.id, item.productId))
      }
    }

    await tx.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId))
    return true
  })
}

export async function countOrders(): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(orders)
  return row?.value ?? 0
}

export async function sumRevenueCents(): Promise<number> {
  const [row] = await getDb()
    .select({ value: sql<number>`coalesce(sum(${orders.totalCents}), 0)`.mapWith(Number) })
    .from(orders)
    .where(ne(orders.status, ORDER_STATUSES.CANCELLED))

  return row?.value ?? 0
}
