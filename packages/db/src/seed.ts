import { ROLES, type Role } from '@repo/types'
import { hashPassword } from '@repo/utils/node'
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

import { closeDb } from './client'
import { syncAuthorizationCatalog } from './repositories/roles'
import {
  assignRolesToUser,
  createUser,
  findUserCredentialsByEmail,
  updateUserPassword,
} from './repositories/users'

config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)), quiet: true })

interface SeedUser {
  email: string
  name: string
  password: string
  roles: Role[]
}

function getSeedUsers(): SeedUser[] {
  return [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!',
      roles: [ROLES.ADMIN, ROLES.USER],
    },
    {
      email: 'user@example.com',
      name: 'Demo User',
      password: process.env.SEED_USER_PASSWORD ?? 'User123!',
      roles: [ROLES.USER],
    },
  ]
}

async function upsertUser(input: SeedUser): Promise<void> {
  const existing = await findUserCredentialsByEmail(input.email)
  const passwordHash = await hashPassword(input.password)

  if (existing) {
    await updateUserPassword(existing.id, passwordHash)
    await assignRolesToUser(existing.id, input.roles)
    return
  }

  const created = await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
  })
  await assignRolesToUser(created.id, input.roles)
}

async function main(): Promise<void> {
  console.log('Seeding authorization catalog...')
  await syncAuthorizationCatalog()

  const seedUsers = getSeedUsers()
  console.log('Seeding users...')

  for (const user of seedUsers) {
    await upsertUser(user)
    console.log(`  ${user.email} (${user.roles.join(', ')})`)
  }

  console.log('\nSeed complete. Development credentials:')
  for (const user of seedUsers) {
    console.log(`  ${user.email} / ${user.password}`)
  }
}

main()
  .catch((error: unknown) => {
    console.error('Seeding failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => closeDb())
