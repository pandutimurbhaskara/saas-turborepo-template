import { z } from 'zod'

const applicationEnvSchema = z.object({
  APP_DOMAIN: z.string().min(1, 'APP_DOMAIN is required'),
  STORE_APP_URL: z.url('STORE_APP_URL must be a valid URL'),
  ADMIN_APP_URL: z.url('ADMIN_APP_URL must be a valid URL'),
})

export type ApplicationEnv = z.infer<typeof applicationEnvSchema>

let cachedEnv: ApplicationEnv | null = null

export function getApplicationEnv(env: NodeJS.ProcessEnv = process.env): ApplicationEnv {
  if (env === process.env && cachedEnv) return cachedEnv

  const parsed = applicationEnvSchema.safeParse(env)
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid application environment configuration -> ${details}`)
  }

  if (env === process.env) cachedEnv = parsed.data
  return parsed.data
}
