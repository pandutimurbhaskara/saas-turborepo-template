import { config } from 'dotenv'
import type { NextConfig } from 'next'
import path from 'node:path'

config({ path: path.resolve(process.cwd(), '../../.env'), quiet: true })

const storageUrl = new URL(
  process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || 'http://localhost:9000',
)

// Local development serves product images from MinIO on a loopback address,
// which the image optimizer blocks by default as an SSRF precaution.
const storageIsLocal = ['localhost', '127.0.0.1', '::1'].includes(storageUrl.hostname)

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@repo/auth',
    '@repo/db',
    '@repo/domain',
    '@repo/storage',
    '@repo/types',
    '@repo/ui',
    '@repo/utils',
  ],
  images: {
    dangerouslyAllowLocalIP: storageIsLocal,
    remotePatterns: [
      {
        protocol: storageUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: storageUrl.hostname,
        port: storageUrl.port,
      },
    ],
  },
  allowedDevOrigins: ['*.localhost', 'localhost'],
}

export default nextConfig
