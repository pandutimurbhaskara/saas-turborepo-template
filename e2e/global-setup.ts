import { execSync } from 'node:child_process'
import path from 'node:path'
import { config as loadEnv } from 'dotenv'

export default function globalSetup(): void {
  loadEnv({ path: path.resolve(process.cwd(), '.env'), quiet: true })

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is required to run end-to-end tests. Copy .env.example to .env and start PostgreSQL.',
    )
  }

  execSync('pnpm --filter @repo/db db:migrate', { stdio: 'inherit', env: process.env })
  execSync('pnpm --filter @repo/db db:seed', { stdio: 'inherit', env: process.env })

  try {
    execSync('pnpm --filter @repo/storage storage:setup', { stdio: 'inherit', env: process.env })
  } catch {
    console.warn(
      'Storage setup skipped — start MinIO (docker compose up -d) to exercise image uploads.',
    )
  }
}
