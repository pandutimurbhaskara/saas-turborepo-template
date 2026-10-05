'use server'

import { getCurrentUser } from '@repo/auth'
import { updateUserPreferences } from '@repo/db'
import { INITIAL_FORM_STATE, type FormState } from '@repo/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updatePreferencesAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  await updateUserPreferences(user.id, {
    productUpdates: formData.get('productUpdates') === 'on',
    weeklyDigest: formData.get('weeklyDigest') === 'on',
  })

  revalidatePath('/settings')

  return { ...INITIAL_FORM_STATE, status: 'success', message: 'Preferences saved.' }
}
