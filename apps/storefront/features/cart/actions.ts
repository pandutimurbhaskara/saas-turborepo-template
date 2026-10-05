'use server'

import { getCurrentUser } from '@repo/auth'
import {
  getCartBySession,
  getCartByUser,
  getCartItem,
  getCartItems,
  getOrCreateCartBySession,
  getOrCreateCartForUser,
  getProductById,
  removeCartItem,
  updateCartItemQuantity,
  upsertCartItemQuantity,
  type CartRecord,
} from '@repo/db'
import { INITIAL_FORM_STATE, PRODUCT_STATUSES, type FormState } from '@repo/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { ensureCartSessionId, getCartSessionId } from '@/lib/cart'

const MAX_QUANTITY_PER_ITEM = 99

async function resolveCartForWrite(): Promise<CartRecord> {
  const user = await getCurrentUser()
  if (user) return getOrCreateCartForUser(user.id)

  const sessionId = await ensureCartSessionId()
  return getOrCreateCartBySession(sessionId)
}

async function resolveCartForRead(): Promise<CartRecord | null> {
  const user = await getCurrentUser()
  if (user) return getCartByUser(user.id)

  const sessionId = await getCartSessionId()
  if (!sessionId) return null

  return getCartBySession(sessionId)
}

export async function addToCartAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const productId = String(formData.get('productId') ?? '')
  if (!productId) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: 'Product not found.' }
  }

  const requested = Number.parseInt(String(formData.get('quantity') ?? '1'), 10)
  const quantity =
    Number.isInteger(requested) && requested > 0 ? Math.min(requested, MAX_QUANTITY_PER_ITEM) : 1

  const product = await getProductById(productId)
  if (!product || product.status !== PRODUCT_STATUSES.ACTIVE) {
    return {
      ...INITIAL_FORM_STATE,
      status: 'error',
      message: 'This product is no longer available.',
    }
  }
  if (product.stock <= 0) {
    return {
      ...INITIAL_FORM_STATE,
      status: 'error',
      message: 'This product is currently out of stock.',
    }
  }

  const cart = await resolveCartForWrite()
  const existing = await getCartItem(cart.id, productId)
  const desired = Math.min(
    (existing?.quantity ?? 0) + quantity,
    product.stock,
    MAX_QUANTITY_PER_ITEM,
  )

  await upsertCartItemQuantity(cart.id, productId, desired)

  revalidatePath('/cart')
  revalidatePath('/', 'layout')
  redirect('/cart')
}

export async function updateCartItemQuantityAction(formData: FormData): Promise<void> {
  const cartItemId = String(formData.get('cartItemId') ?? '')
  if (!cartItemId) return

  const cart = await resolveCartForRead()
  if (!cart) return

  const items = await getCartItems(cart.id)
  const item = items.find((entry) => entry.id === cartItemId)
  if (!item) return

  if (item.stock <= 0) {
    await removeCartItem(cart.id, cartItemId)
  } else {
    const requested = Number.parseInt(String(formData.get('quantity') ?? ''), 10)
    const quantity = Number.isInteger(requested) ? requested : item.quantity
    const clamped = Math.min(Math.max(quantity, 1), Math.min(item.stock, MAX_QUANTITY_PER_ITEM))
    await updateCartItemQuantity(cart.id, cartItemId, clamped)
  }

  revalidatePath('/cart')
  revalidatePath('/', 'layout')
}

export async function removeCartItemAction(formData: FormData): Promise<void> {
  const cartItemId = String(formData.get('cartItemId') ?? '')
  if (!cartItemId) return

  const cart = await resolveCartForRead()
  if (!cart) return

  await removeCartItem(cart.id, cartItemId)

  revalidatePath('/cart')
  revalidatePath('/', 'layout')
}
