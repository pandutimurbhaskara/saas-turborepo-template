import { S3Client } from '@aws-sdk/client-s3'

import { getStorageEnv } from './env'

const globalForStorage = globalThis as unknown as { __storageClient?: S3Client }

export function getStorageClient(): S3Client {
  if (globalForStorage.__storageClient) return globalForStorage.__storageClient

  const env = getStorageEnv()

  const client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  })

  globalForStorage.__storageClient = client
  return client
}
