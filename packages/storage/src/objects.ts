import {
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PRODUCT_IMAGE_MIME_TYPES, type ProductImageMimeType } from '@repo/types'
import { randomUUID } from 'node:crypto'

import { getStorageClient } from './client'
import { getStorageEnv } from './env'

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

const EXTENSION_BY_MIME_TYPE: Record<ProductImageMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export function isSupportedImageMimeType(value: string): value is ProductImageMimeType {
  return (PRODUCT_IMAGE_MIME_TYPES as readonly string[]).includes(value)
}

export function buildProductImageKey(contentType: string): string {
  if (!isSupportedImageMimeType(contentType)) {
    throw new StorageError(`Unsupported image type: ${contentType}`)
  }

  return `products/${randomUUID()}.${EXTENSION_BY_MIME_TYPE[contentType]}`
}

export async function createPresignedUploadUrl(options: {
  key: string
  contentType: string
  expiresIn?: number
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getStorageEnv().S3_BUCKET,
    Key: options.key,
    ContentType: options.contentType,
  })

  return getSignedUrl(getStorageClient(), command, { expiresIn: options.expiresIn ?? 600 })
}

export function getPublicUrl(key: string): string {
  const env = getStorageEnv()
  const base = (env.S3_PUBLIC_URL ?? `${env.S3_ENDPOINT}/${env.S3_BUCKET}`).replace(/\/+$/, '')
  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${base}/${encodedKey}`
}

export async function deleteObject(key: string): Promise<void> {
  await getStorageClient().send(
    new DeleteObjectCommand({ Bucket: getStorageEnv().S3_BUCKET, Key: key }),
  )
}

export async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return

  const client = getStorageClient()
  const bucket = getStorageEnv().S3_BUCKET

  for (let index = 0; index < keys.length; index += 1000) {
    const batch = keys.slice(index, index + 1000)
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((key) => ({ Key: key })) },
      }),
    )
  }
}

export async function ensureBucket(): Promise<{ created: boolean; bucket: string }> {
  const client = getStorageClient()
  const bucket = getStorageEnv().S3_BUCKET
  let created = false

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }))
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: bucket }))
    created = true
  }

  await client.send(
    new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadObjects',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      }),
    }),
  )

  return { created, bucket }
}
