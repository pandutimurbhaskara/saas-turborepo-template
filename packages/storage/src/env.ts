import { z } from 'zod'

const storageEnvSchema = z.object({
  S3_ENDPOINT: z.url('S3_ENDPOINT must be a valid URL'),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().min(1, 'S3_ACCESS_KEY_ID is required'),
  S3_SECRET_ACCESS_KEY: z.string().min(1, 'S3_SECRET_ACCESS_KEY is required'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
  S3_PUBLIC_URL: z.url('S3_PUBLIC_URL must be a valid URL').optional(),
})

export type StorageEnv = z.infer<typeof storageEnvSchema>

let cachedEnv: StorageEnv | null = null

export function getStorageEnv(env: NodeJS.ProcessEnv = process.env): StorageEnv {
  if (env === process.env && cachedEnv) return cachedEnv

  const parsed = storageEnvSchema.safeParse(env)
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid storage environment configuration -> ${details}`)
  }

  if (env === process.env) cachedEnv = parsed.data
  return parsed.data
}
