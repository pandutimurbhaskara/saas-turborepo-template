import { expect, test } from '@playwright/test'

const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? 'http://admin.localhost:3001'
const CUSTOMER_EMAIL = 'customer@example.com'
const CUSTOMER_PASSWORD = process.env.SEED_CUSTOMER_PASSWORD ?? 'Customer123!'
const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!'

test.describe('store checkout flow', () => {
  test('a guest fills a cart, checks out and the admin fulfils the order', async ({ page }) => {
    // Browse the catalog and open the seeded product.
    await page.goto('/products')
    await expect(page.getByRole('heading', { level: 1, name: 'Products' })).toBeVisible()
    await page.getByRole('link', { name: 'Classic Crew Tee' }).first().click()
    await expect(page.getByRole('heading', { level: 1, name: 'Classic Crew Tee' })).toBeVisible()

    // Add it to the guest cart.
    await page.getByRole('button', { name: 'Add to cart' }).click()
    await expect(page).toHaveURL(/\/cart$/)
    await expect(page.getByRole('link', { name: 'Classic Crew Tee' })).toBeVisible()

    // Checkout requires an account.
    await page.getByRole('link', { name: 'Proceed to checkout' }).click()
    await expect(page).toHaveURL(/\/login/)

    // Sign in as the seeded customer and land back on checkout with the cart intact.
    await page.getByLabel('Email').fill(CUSTOMER_EMAIL)
    await page.getByLabel('Password').fill(CUSTOMER_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/checkout$/)
    await expect(page.getByText('Classic Crew Tee ×')).toBeVisible()

    // Place the demo order.
    await page.getByLabel('Full name').fill('Demo Customer')
    await page.getByLabel('Address', { exact: true }).fill('123 Example Street')
    await page.getByLabel('City').fill('Springfield')
    await page.getByLabel('Postal code').fill('12345')
    await page.getByLabel('Country').fill('United States')
    await page.getByRole('button', { name: 'Place order' }).click()

    await expect(page).toHaveURL(/\/orders\/ORD-/)
    await expect(page.getByText('Order placed — thank you!')).toBeVisible()
    const orderNumber = page.url().split('/orders/')[1]?.split('?')[0] ?? ''
    expect(orderNumber).toMatch(/^ORD-/)

    // The admin sees the new order and moves it to processing.
    await page.goto(`${ADMIN_APP_URL}/login`)
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)

    await page.goto(`${ADMIN_APP_URL}/orders`)
    const orderRow = page.getByRole('row', { name: new RegExp(orderNumber) })
    await expect(orderRow).toBeVisible()
    await orderRow.getByRole('link', { name: 'View' }).click()
    await expect(page.getByRole('heading', { level: 1, name: orderNumber })).toBeVisible()

    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Processing' }).click()
    await page.getByRole('button', { name: 'Update status' }).click()
    await expect(page.getByText('Order status updated.')).toBeVisible()

    // The customer (still signed in on the storefront host) sees the updated status.
    await page.goto('/orders')
    await expect(page.getByRole('row', { name: new RegExp(orderNumber) })).toContainText(
      'Processing',
    )
  })
})
