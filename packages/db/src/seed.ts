import { ORDER_STATUSES, PRODUCT_STATUSES, ROLES, type ProductStatus, type Role } from '@repo/types'
import { generateOrderNumber } from '@repo/utils'
import { hashPassword } from '@repo/utils/node'
import { config } from 'dotenv'
import { count, eq } from 'drizzle-orm'
import { fileURLToPath } from 'node:url'

import { closeDb, getDb } from './client'
import { categories, orderItems, orders, products } from './schema'
import { syncAuthorizationCatalog } from './repositories/roles'
import {
  assignRolesToUser,
  createUser,
  findUserCredentialsByEmail,
  updateUserPassword,
} from './repositories/users'

config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)), quiet: true })

interface SeedUser {
  email: string
  name: string
  password: string
  roles: Role[]
}

interface SeedProduct {
  name: string
  slug: string
  description: string
  priceCents: number
  stock: number
  status: ProductStatus
  categorySlug: string
}

const SEED_CATEGORIES = [
  { name: 'Apparel', slug: 'apparel' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Home & Living', slug: 'home-living' },
]

const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: 'Classic Crew Tee',
    slug: 'classic-crew-tee',
    description:
      'A heavyweight organic cotton tee with a relaxed fit and a reinforced collar. Pre-shrunk and built to last.',
    priceCents: 2400,
    stock: 40,
    status: PRODUCT_STATUSES.ACTIVE,
    categorySlug: 'apparel',
  },
  {
    name: 'Merino Beanie',
    slug: 'merino-beanie',
    description:
      'Fine merino wool beanie, soft enough for all-day wear and warm enough for real winters.',
    priceCents: 3200,
    stock: 25,
    status: PRODUCT_STATUSES.ACTIVE,
    categorySlug: 'accessories',
  },
  {
    name: 'Canvas Tote Bag',
    slug: 'canvas-tote-bag',
    description:
      'A sturdy 16oz canvas tote with reinforced handles and an interior pocket for the small stuff.',
    priceCents: 2800,
    stock: 30,
    status: PRODUCT_STATUSES.ACTIVE,
    categorySlug: 'accessories',
  },
  {
    name: 'Ceramic Mug Set',
    slug: 'ceramic-mug-set',
    description: 'Set of two stoneware mugs with a matte glaze. Dishwasher and microwave safe.',
    priceCents: 4200,
    stock: 15,
    status: PRODUCT_STATUSES.ACTIVE,
    categorySlug: 'home-living',
  },
  {
    name: 'Linen Throw Blanket',
    slug: 'linen-throw-blanket',
    description:
      'Stonewashed linen throw that gets softer with every wash. Generously sized for two.',
    priceCents: 8900,
    stock: 8,
    status: PRODUCT_STATUSES.ACTIVE,
    categorySlug: 'home-living',
  },
  {
    name: 'Wool Socks 3-Pack',
    slug: 'wool-socks-3-pack',
    description: 'Three pairs of cushioned merino wool socks with a reinforced heel and toe.',
    priceCents: 1800,
    stock: 3,
    status: PRODUCT_STATUSES.ACTIVE,
    categorySlug: 'apparel',
  },
  {
    name: 'Summer Straw Hat',
    slug: 'summer-straw-hat',
    description: 'Lightweight woven straw hat with a wide brim. Launching next season.',
    priceCents: 3600,
    stock: 0,
    status: PRODUCT_STATUSES.DRAFT,
    categorySlug: 'accessories',
  },
]

function getSeedUsers(): SeedUser[] {
  return [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!',
      roles: [ROLES.ADMIN],
    },
    {
      email: 'customer@example.com',
      name: 'Demo Customer',
      password: process.env.SEED_CUSTOMER_PASSWORD ?? 'Customer123!',
      roles: [ROLES.CUSTOMER],
    },
  ]
}

async function upsertUser(input: SeedUser): Promise<void> {
  const existing = await findUserCredentialsByEmail(input.email)
  const passwordHash = await hashPassword(input.password)

  if (existing) {
    await updateUserPassword(existing.id, passwordHash)
    await assignRolesToUser(existing.id, input.roles)
    return
  }

  const created = await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
  })
  await assignRolesToUser(created.id, input.roles)
}

async function seedCatalog(): Promise<void> {
  const db = getDb()

  for (const category of SEED_CATEGORIES) {
    await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({ target: categories.slug, set: { name: category.name } })
  }

  const categoryRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
  const categoryIdBySlug = new Map(categoryRows.map((row) => [row.slug, row.id]))

  for (const product of SEED_PRODUCTS) {
    await db
      .insert(products)
      .values({
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        status: product.status,
        categoryId: categoryIdBySlug.get(product.categorySlug) ?? null,
      })
      .onConflictDoNothing({ target: products.slug })
  }
}

async function seedOrders(customerId: string): Promise<void> {
  const db = getDb()

  const [existing] = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.userId, customerId))
  if ((existing?.value ?? 0) > 0) return

  const productRows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      priceCents: products.priceCents,
    })
    .from(products)
  const productBySlug = new Map(productRows.map((row) => [row.slug, row]))

  const shippingAddress = {
    fullName: 'Demo Customer',
    email: 'customer@example.com',
    line1: '123 Example Street',
    city: 'Springfield',
    postalCode: '12345',
    country: 'United States',
  }

  const sampleOrders: Array<{
    status: (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]
    items: ReadonlyArray<readonly [slug: string, quantity: number]>
  }> = [
    {
      status: ORDER_STATUSES.SHIPPED,
      items: [
        ['classic-crew-tee', 2],
        ['canvas-tote-bag', 1],
      ],
    },
    { status: ORDER_STATUSES.PENDING, items: [['ceramic-mug-set', 1]] },
  ]

  for (const sample of sampleOrders) {
    const items = sample.items.flatMap(([slug, quantity]) => {
      const product = productBySlug.get(slug)
      return product ? [{ product, quantity }] : []
    })
    if (items.length === 0) continue

    const subtotalCents = items.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0,
    )

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId: customerId,
        email: shippingAddress.email,
        status: sample.status,
        subtotalCents,
        totalCents: subtotalCents,
        shippingAddress,
      })
      .returning({ id: orders.id })

    if (!order) continue

    await db.insert(orderItems).values(
      items.map(({ product, quantity }) => ({
        orderId: order.id,
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        quantity,
        imageKey: null,
      })),
    )
  }
}

async function main(): Promise<void> {
  console.log('Seeding authorization catalog...')
  await syncAuthorizationCatalog()

  const seedUsers = getSeedUsers()
  console.log('Seeding users...')

  for (const user of seedUsers) {
    await upsertUser(user)
    console.log(`  ${user.email} (${user.roles.join(', ')})`)
  }

  console.log('Seeding catalog...')
  await seedCatalog()
  console.log(`  ${SEED_CATEGORIES.length} categories, ${SEED_PRODUCTS.length} products`)

  const customer = await findUserCredentialsByEmail('customer@example.com')
  if (customer) {
    console.log('Seeding sample orders...')
    await seedOrders(customer.id)
  }

  console.log('\nSeed complete. Development credentials:')
  for (const user of seedUsers) {
    console.log(`  ${user.email} / ${user.password}`)
  }
}

main()
  .catch((error: unknown) => {
    console.error('Seeding failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => closeDb())
