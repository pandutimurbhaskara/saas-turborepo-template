import type { Permission, Role, User, UserPreferences } from '@repo/types'
import { count, desc, eq, inArray } from 'drizzle-orm'

import { getDb } from '../client'
import { permissions, rolePermissions, roles, userRoles, users } from '../schema'

const userColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  image: users.image,
  preferences: users.preferences,
  createdAt: users.createdAt,
}

export type UserRecord = {
  id: string
  email: string
  name: string | null
  image: string | null
  preferences: UserPreferences
  createdAt: Date
}

export interface UserCredentials {
  id: string
  email: string
  name: string | null
  passwordHash: string | null
}

export interface UserListItem {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: Date
  roles: Role[]
}

export interface CreateUserInput {
  email: string
  name?: string | null
  passwordHash?: string | null
}

export async function findUserById(userId: string): Promise<UserRecord | null> {
  const [row] = await getDb()
    .select(userColumns)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return row ?? null
}

export async function findUserCredentialsByEmail(email: string): Promise<UserCredentials | null> {
  const [row] = await getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  return row ?? null
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const [row] = await getDb()
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      name: input.name ?? null,
      passwordHash: input.passwordHash ?? null,
    })
    .returning(userColumns)

  if (!row) throw new Error('Failed to create user')
  return row
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await getDb()
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId))
}

export async function updateUserProfile(
  userId: string,
  input: { name: string },
): Promise<UserRecord | null> {
  const [row] = await getDb()
    .update(users)
    .set({ name: input.name, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(userColumns)

  return row ?? null
}

export async function updateUserPreferences(
  userId: string,
  preferences: UserPreferences,
): Promise<UserRecord | null> {
  const [row] = await getDb()
    .update(users)
    .set({ preferences, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(userColumns)

  return row ?? null
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const [row] = await getDb()
    .select({ preferences: users.preferences })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return row?.preferences ?? null
}

export async function assignRolesToUser(userId: string, roleKeys: Role[]): Promise<void> {
  if (roleKeys.length === 0) return

  const db = getDb()
  const roleRows = await db
    .select({ id: roles.id })
    .from(roles)
    .where(inArray(roles.key, roleKeys))

  if (roleRows.length === 0) return

  await db
    .insert(userRoles)
    .values(roleRows.map((role) => ({ userId, roleId: role.id })))
    .onConflictDoNothing()
}

export async function getUserAuthorization(
  userId: string,
): Promise<{ roles: Role[]; permissions: Permission[] }> {
  const db = getDb()

  const roleRows = await db
    .selectDistinct({ key: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))

  const permissionRows = await db
    .selectDistinct({ key: permissions.key })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId))

  return {
    roles: roleRows.map((row) => row.key as Role),
    permissions: permissionRows.map((row) => row.key as Permission),
  }
}

export async function getUserWithAuthorization(userId: string): Promise<User | null> {
  const record = await findUserById(userId)
  if (!record) return null

  const authorization = await getUserAuthorization(userId)

  return {
    id: record.id,
    email: record.email,
    name: record.name,
    image: record.image,
    roles: authorization.roles,
    permissions: authorization.permissions,
    createdAt: record.createdAt,
  }
}

export async function listUsers(): Promise<UserListItem[]> {
  const rows = await getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      createdAt: users.createdAt,
      roleKey: roles.key,
    })
    .from(users)
    .leftJoin(userRoles, eq(userRoles.userId, users.id))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .orderBy(desc(users.createdAt))

  const items = new Map<string, UserListItem>()

  for (const row of rows) {
    let item = items.get(row.id)
    if (!item) {
      item = {
        id: row.id,
        email: row.email,
        name: row.name,
        image: row.image,
        createdAt: row.createdAt,
        roles: [],
      }
      items.set(row.id, item)
    }
    if (row.roleKey) item.roles.push(row.roleKey as Role)
  }

  return [...items.values()]
}

export async function countUsers(): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(users)
  return row?.value ?? 0
}
