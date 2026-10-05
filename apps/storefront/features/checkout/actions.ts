'use server'

import { getCurrentUser } from '@repo/auth'
import {
  getCartBySession,
  getCartItems,
  getOrCreateCartForUser,
  InsufficientStockError,
  mergeCarts,
  placeOrder,
} from '@repo/db'
import { INITIAL_FORM_STATE, type FormState, type OrderAddress } from '@repo/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { clearCartSessionId, getCartSessionId } from '@/lib/cart'

function readField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

export async function placeOrderAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/checkout')

  const sessionId = await getCartSessionId()
  if (sessionId) {
    const guestCart = await getCartBySession(sessionId)
    if (guestCart) {
      const userCart = await getOrCreateCartForUser(user.id)
      if (guestCart.id !== userCart.id) await mergeCarts(guestCart.id, userCart.id)
    }
    await clearCartSessionId()
  }

  const cart = await getOrCreateCartForUser(user.id)
  const items = await getCartItems(cart.id)
  if (items.length === 0) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: 'Your cart is empty.' }
  }

  const fullName = readField(formData, 'fullName')
  const email = readField(formData, 'email').toLowerCase()
  const line1 = readField(formData, 'line1')
  const line2 = readField(formData, 'line2')
  const city = readField(formData, 'city')
  const region = readField(formData, 'region')
  const postalCode = readField(formData, 'postalCode')
  const country = readField(formData, 'country')
  const phone = readField(formData, 'phone')

  if (
    fullName.length < 1 ||
    fullName.length > 200 ||
    line1.length < 1 ||
    line1.length > 300 ||
    city.length < 1 ||
    city.length > 120 ||
    postalCode.length < 1 ||
    postalCode.length > 40 ||
    country.length < 1 ||
    country.length > 120
  ) {
    return {
      ...INITIAL_FORM_STATE,
      status: 'error',
      message: 'Fill in every required shipping field.',
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: 'Enter a valid email address.' }
  }

  const shippingAddress: OrderAddress = {
    fullName,
    email,
    line1,
    city,
    postalCode,
    country,
    ...(phone ? { phone } : {}),
    ...(line2 ? { line2 } : {}),
    ...(region ? { region } : {}),
  }

  let orderNumber: string
  try {
    const order = await placeOrder({
      userId: user.id,
      email,
      shippingAddress,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        priceCents: item.priceCents,
        quantity: item.quantity,
        imageKey: item.imageKey,
      })),
      cartId: cart.id,
    })
    orderNumber = order.orderNumber
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        ...INITIAL_FORM_STATE,
        status: 'error',
        message:
          'One or more items are no longer available in the requested quantity. Review your cart and try again.',
      }
    }
    throw error
  }

  revalidatePath('/cart')
  revalidatePath('/orders')
  redirect(`/orders/${orderNumber}?placed=1`)
}
