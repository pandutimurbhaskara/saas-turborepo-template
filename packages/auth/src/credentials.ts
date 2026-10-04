import { assignRolesToUser, createUser, findUserCredentialsByEmail, getUserWithAuthorization } from '@repo/db'
import { ROLES, type User } from '@repo/types'
import { hashPassword, verifyPassword } from '@repo/utils/node'
import { z } from 'zod'

import { AuthError, EmailTakenError, InvalidCredentialsError } from './errors'
import { startSession } from './session'

const DUMMY_PASSWORD_HASH = `scrypt:16384:8:1:${'0'.repeat(32)}:${'0'.repeat(128)}`

const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  name: string
  email: string
  password: string
}

export async function signIn(input: SignInInput): Promise<User> {
  const email = input.email.trim().toLowerCase()
  const record = await findUserCredentialsByEmail(email)

  const passwordHash = record?.passwordHash ?? DUMMY_PASSWORD_HASH
  const passwordMatches = await verifyPassword(input.password, passwordHash)

  if (!record || !record.passwordHash || !passwordMatches) {
    throw new InvalidCredentialsError()
  }

  const user = await getUserWithAuthorization(record.id)
  if (!user) throw new InvalidCredentialsError()

  await startSession(user.id)
  return user
}

export async function signUp(input: SignUpInput): Promise<User> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    throw new AuthError('invalid_input', parsed.error.issues[0]?.message ?? 'Invalid input.')
  }

  const email = parsed.data.email.trim().toLowerCase()

  const existing = await findUserCredentialsByEmail(email)
  if (existing) throw new EmailTakenError()

  const passwordHash = await hashPassword(parsed.data.password)
  const created = await createUser({ email, name: parsed.data.name, passwordHash })
  await assignRolesToUser(created.id, [ROLES.USER])

  const user = await getUserWithAuthorization(created.id)
  if (!user) throw new AuthError('internal', 'Failed to load the created account.')

  await startSession(user.id)
  return user
}
