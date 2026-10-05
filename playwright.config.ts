import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'

loadEnv({ path: path.resolve(process.cwd(), '.env'), quiet: true })

const STORE_APP_URL = process.env.STORE_APP_URL ?? 'http://localhost:3000'
const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? 'http://admin.localhost:3001'

function portOf(url: string, fallback: number): number {
  try {
    const parsed = new URL(url)
    if (parsed.port) return Number(parsed.port)
    return parsed.protocol === 'https:' ? 443 : 80
  } catch {
    return fallback
  }
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: STORE_APP_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  globalSetup: './e2e/global-setup.ts',
  webServer: [
    {
      command: 'pnpm --filter storefront dev',
      port: portOf(STORE_APP_URL, 3000),
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { ...process.env, NODE_ENV: 'development' },
    },
    {
      command: 'pnpm --filter admin dev',
      port: portOf(ADMIN_APP_URL, 3001),
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { ...process.env, NODE_ENV: 'development' },
    },
  ],
})
