'use server'

import { signOut } from '@repo/auth'
import { redirect } from 'next/navigation'

export async function signOutAction(): Promise<void> {
  await signOut()
  redirect('/')
}
