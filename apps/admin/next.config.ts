import { config } from 'dotenv'
import type { NextConfig } from 'next'
import path from 'node:path'

config({ path: path.resolve(process.cwd(), '../../.env'), quiet: true })

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@repo/auth',
    '@repo/db',
    '@repo/domain',
    '@repo/types',
    '@repo/ui',
    '@repo/utils',
  ],
  allowedDevOrigins: ['*.localhost', 'localhost'],
}

export default nextConfig
