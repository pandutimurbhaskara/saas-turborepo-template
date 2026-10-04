'use server'

import { AuthError, signIn } from '@repo/auth'
import { INITIAL_FORM_STATE, type FormState } from '@repo/types'
import { safeRedirectPath } from '@repo/utils'
import { redirect } from 'next/navigation'

export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = safeRedirectPath(formData.get('next')?.toString(), '/dashboard')

  try {
    await signIn({ email, password })
  } catch (error) {
    if (error instanceof AuthError) {
      return { ...INITIAL_FORM_STATE, status: 'error', message: error.message }
    }
    throw error
  }

  redirect(next)
}
