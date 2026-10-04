import { requireApplicationAccess } from '@repo/auth'
import { listUsers } from '@repo/db'
import {
  Badge,
  EmptyState,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { formatDate } from '@repo/utils'
import { Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Users',
}

export default async function AdminUsersPage() {
  await requireApplicationAccess('admin', { loginPath: '/login', forbiddenPath: '/forbidden' })

  const users = await listUsers()

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Users"
        title="Users"
        description="A read-only view backed by the shared database package. Build management actions on top when your product needs them."
      />

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Run pnpm db:seed to create the development accounts, or register through the user application."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium">{user.name ?? 'Unnamed account'}</p>
                    <p className="text-small text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles.length === 0 ? (
                      <span className="text-small text-subtle-foreground">No roles</span>
                    ) : (
                      user.roles.map((role) => (
                        <Badge key={role} variant={role === 'ADMIN' ? 'primary' : 'default'}>
                          {role}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
