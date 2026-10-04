import { z } from 'zod'

const authEnvSchema = z.object({
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  AUTH_COOKIE_DOMAIN: z.string().optional(),
})

export type AuthEnv = z.infer<typeof authEnvSchema>

let cachedEnv: AuthEnv | null = null

export function getAuthEnv(env: NodeJS.ProcessEnv = process.env): AuthEnv {
  if (env === process.env && cachedEnv) return cachedEnv

  const parsed = authEnvSchema.safeParse(env)
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid auth environment configuration -> ${details}`)
  }

  if (env === process.env) cachedEnv = parsed.data
  return parsed.data
}
