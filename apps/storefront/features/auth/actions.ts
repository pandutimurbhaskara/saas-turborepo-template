'use server'

import { AuthError, signIn, signUp } from '@repo/auth'
import { getCartBySession, getOrCreateCartForUser, mergeCarts } from '@repo/db'
import { CART_COOKIE_NAME, INITIAL_FORM_STATE, type FormState } from '@repo/types'
import { safeRedirectPath } from '@repo/utils'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function mergeGuestCartIntoUserCart(userId: string): Promise<void> {
  const store = await cookies()
  const sessionId = store.get(CART_COOKIE_NAME)?.value
  if (!sessionId) return

  const guestCart = await getCartBySession(sessionId)
  store.delete(CART_COOKIE_NAME)
  if (!guestCart) return

  const userCart = await getOrCreateCartForUser(userId)
  if (userCart.id !== guestCart.id) {
    await mergeCarts(guestCart.id, userCart.id)
  }

  revalidatePath('/', 'layout')
}

export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = safeRedirectPath(formData.get('next')?.toString(), '/dashboard')

  let userId: string
  try {
    const user = await signIn({ email, password })
    userId = user.id
  } catch (error) {
    if (error instanceof AuthError) {
      return { ...INITIAL_FORM_STATE, status: 'error', message: error.message }
    }
    throw error
  }

  await mergeGuestCartIntoUserCart(userId)

  redirect(next)
}

export async function registerAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  let userId: string
  try {
    const user = await signUp({ name, email, password })
    userId = user.id
  } catch (error) {
    if (error instanceof AuthError) {
      return { ...INITIAL_FORM_STATE, status: 'error', message: error.message }
    }
    throw error
  }

  await mergeGuestCartIntoUserCart(userId)

  redirect('/dashboard')
}
