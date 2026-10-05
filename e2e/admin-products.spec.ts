import { expect, test, type Locator, type Page } from '@playwright/test'

const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? 'http://admin.localhost:3001'
const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!'

async function createPngBuffer(page: Page): Promise<Buffer> {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D context unavailable')
    context.fillStyle = '#3366ff'
    context.fillRect(0, 0, 64, 64)
    context.fillStyle = '#ffcc00'
    context.fillRect(16, 16, 32, 32)
    return canvas.toDataURL('image/png')
  })

  return Buffer.from(dataUrl.split(',')[1] ?? '', 'base64')
}

async function expectImageLoaded(locator: Locator) {
  await expect(locator).toBeVisible({ timeout: 15000 })
  await expect
    .poll(() => locator.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), {
      timeout: 15000,
    })
    .toBe(true)
}

test.describe('admin product management', () => {
  test('an admin creates a product with an uploaded image and deletes it again', async ({
    page,
  }) => {
    await page.goto(`${ADMIN_APP_URL}/login`)
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)

    const png = await createPngBuffer(page)

    // Create a product and upload an image straight to object storage.
    await page.goto(`${ADMIN_APP_URL}/products/new`)
    await page.getByLabel('Name').fill('E2E Upload Product')
    await page.getByLabel('Price').fill('12.34')
    await page.getByLabel('Stock').fill('5')

    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Active' }).click()

    await page.setInputFiles('input[type="file"]', {
      name: 'square.png',
      mimeType: 'image/png',
      buffer: png,
    })
    await expectImageLoaded(page.locator('img[src*="9000"]').first())

    await page.getByRole('button', { name: 'Create product' }).click()
    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByRole('row', { name: /E2E Upload Product/ })).toBeVisible()
    await expectImageLoaded(
      page.getByRole('row', { name: /E2E Upload Product/ }).locator('img[src*="9000"]'),
    )

    // The active product and its stored image are served on the storefront too.
    await page.goto('/products/e2e-upload-product')
    await expect(page.getByRole('heading', { level: 1, name: 'E2E Upload Product' })).toBeVisible()
    await expectImageLoaded(page.locator('img[src*="9000"]').first())

    // Editing shows the stored image; deleting removes the product and its object.
    await page.goto(`${ADMIN_APP_URL}/products`)
    await page
      .getByRole('row', { name: /E2E Upload Product/ })
      .getByRole('link', { name: 'Edit' })
      .click()
    await expect(page.getByRole('heading', { level: 1, name: 'E2E Upload Product' })).toBeVisible()
    await expectImageLoaded(page.locator('img[src*="9000"]').first())

    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete product' }).click()
    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByRole('row', { name: /E2E Upload Product/ })).toHaveCount(0)
  })
})
