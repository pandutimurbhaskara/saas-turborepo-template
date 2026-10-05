'use server'

import { requirePermission } from '@repo/auth'
import { updateOrderStatus } from '@repo/db'
import {
  INITIAL_FORM_STATE,
  ORDER_STATUSES,
  PERMISSIONS,
  type FormState,
  type OrderStatus,
} from '@repo/types'
import { revalidatePath } from 'next/cache'

const GUARD_OPTIONS = { loginPath: '/login', forbiddenPath: '/forbidden' }

export async function updateOrderStatusAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission(PERMISSIONS.ORDERS_MANAGE, GUARD_OPTIONS)

  const orderId = String(formData.get('orderId') ?? '')
  if (!orderId) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: 'Order not found.' }
  }

  const status = String(formData.get('status') ?? '')
  const statuses = Object.values(ORDER_STATUSES) as string[]
  if (!statuses.includes(status)) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: 'Choose a valid order status.' }
  }

  const updated = await updateOrderStatus(orderId, status as OrderStatus)
  if (!updated) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: 'Order not found.' }
  }

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)

  return { ...INITIAL_FORM_STATE, status: 'success', message: 'Order status updated.' }
}
