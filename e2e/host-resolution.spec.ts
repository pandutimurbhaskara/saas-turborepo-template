import { expect, test } from '@playwright/test'

const STORE_APP_URL = process.env.STORE_APP_URL ?? 'http://localhost:3000'
const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? 'http://admin.localhost:3001'

test.describe('host-based application resolution', () => {
  test('the apex host resolves the storefront application', async ({ page }) => {
    await page.goto(STORE_APP_URL)

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Everyday essentials, thoughtfully made',
    )
    await expect(page.getByText('Acme Store', { exact: true }).first()).toBeVisible()
  })

  test('the admin subdomain resolves the admin application', async ({ page }) => {
    await page.goto(ADMIN_APP_URL)

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sign in to the console' }),
    ).toBeVisible()
  })

  test('both hosts serve different applications from the same repository', async ({ page }) => {
    await page.goto(STORE_APP_URL)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Everyday essentials')

    await page.goto(ADMIN_APP_URL)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sign in to the console' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).not.toContainText('Everyday essentials')
  })
})
