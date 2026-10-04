import { getCurrentUser } from '@repo/auth'
import { redirect } from 'next/navigation'

export default async function AdminHome() {
  const user = await getCurrentUser()
  redirect(user ? '/dashboard' : '/login')
}
