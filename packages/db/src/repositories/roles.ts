import { ROLE_PERMISSIONS, ROLES, type Role } from '@repo/types'
import { count, eq } from 'drizzle-orm'

import { getDb } from '../client'
import { permissions, rolePermissions, roles } from '../schema'

const ROLE_NAMES: Record<Role, string> = {
  [ROLES.USER]: 'User',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.SELLER]: 'Seller',
  [ROLES.STAFF]: 'Staff',
}

export async function syncAuthorizationCatalog(): Promise<void> {
  const db = getDb()
  const roleKeys = Object.values(ROLES)
  const permissionKeys = [...new Set(Object.values(ROLE_PERMISSIONS).flat())]

  await db.transaction(async (tx) => {
    for (const key of roleKeys) {
      await tx
        .insert(roles)
        .values({ key, name: ROLE_NAMES[key] })
        .onConflictDoUpdate({ target: roles.key, set: { name: ROLE_NAMES[key] } })
    }

    for (const key of permissionKeys) {
      await tx
        .insert(permissions)
        .values({ key })
        .onConflictDoUpdate({ target: permissions.key, set: { key } })
    }

    const roleRows = await tx.select({ id: roles.id, key: roles.key }).from(roles)
    const permissionRows = await tx.select({ id: permissions.id, key: permissions.key }).from(permissions)
    const permissionIdByKey = new Map(permissionRows.map((row) => [row.key, row.id]))

    for (const roleRow of roleRows) {
      const desired = ROLE_PERMISSIONS[roleRow.key as Role] ?? []

      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleRow.id))

      const links = desired.flatMap((permission) => {
        const permissionId = permissionIdByKey.get(permission)
        return permissionId ? [{ roleId: roleRow.id, permissionId }] : []
      })

      if (links.length > 0) {
        await tx.insert(rolePermissions).values(links).onConflictDoNothing()
      }
    }
  })
}

export async function listRoles() {
  return getDb()
    .select({ id: roles.id, key: roles.key, name: roles.name, description: roles.description })
    .from(roles)
    .orderBy(roles.key)
}

export async function listPermissions() {
  return getDb()
    .select({ id: permissions.id, key: permissions.key, description: permissions.description })
    .from(permissions)
    .orderBy(permissions.key)
}

export async function countRoles(): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(roles)
  return row?.value ?? 0
}

export async function countPermissions(): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(permissions)
  return row?.value ?? 0
}
