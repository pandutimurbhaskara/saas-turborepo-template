import { requireApplicationAccess } from '@repo/auth'

import { AdminShell } from '@/components/admin-shell'
import { signOutAction } from '@/lib/actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireApplicationAccess('admin', {
    loginPath: '/login',
    forbiddenPath: '/forbidden',
  })

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, image: user.image }}
      signOutAction={signOutAction}
    >
      {children}
    </AdminShell>
  )
}
