import { requireAuth } from '@repo/auth'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAuth({ loginPath: '/login' })

  return <>{children}</>
}
