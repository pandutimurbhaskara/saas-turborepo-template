import { expect, test } from '@playwright/test'

const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? 'http://admin.localhost:3001'
const SEED_ADMIN_EMAIL = 'admin@example.com'
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!'
const SEED_USER_EMAIL = 'user@example.com'
const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'User123!'

test.describe('admin application access control', () => {
  test('unauthenticated admin access is blocked', async ({ page }) => {
    await page.goto(`${ADMIN_APP_URL}/dashboard`)

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Sign in to the console')).toBeVisible()
  })

  test('authorized admin access succeeds', async ({ page }) => {
    await page.goto(`${ADMIN_APP_URL}/login`)
    await page.getByLabel('Email').fill(SEED_ADMIN_EMAIL)
    await page.getByLabel('Password').fill(SEED_ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: 'Administration overview' })).toBeVisible()

    await page.goto(`${ADMIN_APP_URL}/users`)
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
    await expect(page.getByText(SEED_ADMIN_EMAIL)).toBeVisible()
    await expect(page.getByText(SEED_USER_EMAIL)).toBeVisible()
  })

  test('wrong-role admin access is blocked', async ({ page }) => {
    await page.goto(`${ADMIN_APP_URL}/login`)
    await page.getByLabel('Email').fill(SEED_USER_EMAIL)
    await page.getByLabel('Password').fill(SEED_USER_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/forbidden$/)
    await expect(page.getByText('Access denied')).toBeVisible()

    await page.goto(`${ADMIN_APP_URL}/users`)
    await expect(page).toHaveURL(/\/forbidden$/)
    await expect(page.getByText('Access denied')).toBeVisible()
  })
})
