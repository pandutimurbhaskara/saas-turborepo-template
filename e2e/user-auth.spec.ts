import { expect, test } from '@playwright/test'

const SEED_CUSTOMER_EMAIL = 'customer@example.com'
const SEED_CUSTOMER_PASSWORD = process.env.SEED_CUSTOMER_PASSWORD ?? 'Customer123!'

test.describe('storefront authentication', () => {
  test('a visitor can register, reach the account overview and sign out', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByLabel('Name').fill('E2E User')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('Password123!')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome back, E2E' })).toBeVisible()
    await expect(page.getByText('CUSTOMER', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Account menu' }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()

    await expect(page).toHaveURL('/')

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('a seeded customer can sign in', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(SEED_CUSTOMER_EMAIL)
    await page.getByLabel('Password').fill(SEED_CUSTOMER_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByText(SEED_CUSTOMER_EMAIL)).toBeVisible()
  })

  test('invalid credentials show an error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(SEED_CUSTOMER_EMAIL)
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'Invalid' })).toContainText(
      'Invalid email or password',
    )
    await expect(page).toHaveURL(/\/login/)
  })
})
