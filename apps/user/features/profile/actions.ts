'use server'

import { getCurrentUser } from '@repo/auth'
import { updateUserProfile } from '@repo/db'
import { INITIAL_FORM_STATE, type FormState } from '@repo/types'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const name = String(formData.get('name') ?? '').trim()
  if (name.length < 1 || name.length > 100) {
    return { ...INITIAL_FORM_STATE, status: 'error', message: 'Enter a name between 1 and 100 characters.' }
  }

  await updateUserProfile(user.id, { name })
  revalidatePath('/profile')
  revalidatePath('/dashboard')

  return { ...INITIAL_FORM_STATE, status: 'success', message: 'Profile updated.' }
}
