import { expect, test } from '@playwright/test'

const USER_APP_URL = process.env.USER_APP_URL ?? 'http://localhost:3000'
const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? 'http://admin.localhost:3001'

test.describe('host-based application resolution', () => {
  test('the apex host resolves the user application', async ({ page }) => {
    await page.goto(USER_APP_URL)

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Ship multi-app products from a single codebase',
    )
    await expect(
      page.getByText('Turborepo + Next.js boilerplate', { exact: true }),
    ).toBeVisible()
  })

  test('the admin subdomain resolves the admin application', async ({ page }) => {
    await page.goto(ADMIN_APP_URL)

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sign in to the console' }),
    ).toBeVisible()
  })

  test('both hosts serve different applications from the same repository', async ({ page }) => {
    await page.goto(USER_APP_URL)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ship multi-app products')

    await page.goto(ADMIN_APP_URL)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sign in to the console' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).not.toContainText('Ship multi-app products')
  })
})
