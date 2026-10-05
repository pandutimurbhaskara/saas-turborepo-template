import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

import { ensureBucket } from './objects'

config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)), quiet: true })

async function main(): Promise<void> {
  const { bucket, created } = await ensureBucket()
  console.log(
    `${created ? 'Created' : 'Using existing'} bucket "${bucket}" with public read access.`,
  )
}

main().catch((error: unknown) => {
  console.error('Storage setup failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
