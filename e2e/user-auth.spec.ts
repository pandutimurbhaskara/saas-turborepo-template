import { expect, test } from '@playwright/test'

const SEED_USER_EMAIL = 'user@example.com'
const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'User123!'

test.describe('user application authentication', () => {
  test('a visitor can register, reach the dashboard and sign out', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByLabel('Name').fill('E2E User')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('Password123!')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome back, E2E' })).toBeVisible()
    await expect(page.getByText('USER', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Account menu' }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()

    await expect(page).toHaveURL('/')

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('a seeded user can sign in', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(SEED_USER_EMAIL)
    await page.getByLabel('Password').fill(SEED_USER_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByText(SEED_USER_EMAIL)).toBeVisible()
  })

  test('invalid credentials show an error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(SEED_USER_EMAIL)
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'Invalid' })).toContainText(
      'Invalid email or password',
    )
    await expect(page).toHaveURL(/\/login/)
  })
})
