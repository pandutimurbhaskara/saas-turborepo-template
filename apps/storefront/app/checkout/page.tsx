import { getCurrentUser } from '@repo/auth'
import { getCartItems, getOrCreateCartForUser } from '@repo/db'
import { Card, CardContent, CardHeader, CardTitle, PageHeader } from '@repo/ui'
import { formatCurrency, formatNumber } from '@repo/utils'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { CheckoutForm } from '@/features/checkout/components/checkout-form'

export const metadata: Metadata = {
  title: 'Checkout',
}

export default async function CheckoutPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/checkout')

  const cart = await getOrCreateCartForUser(user.id)
  const items = await getCartItems(cart.id)
  if (items.length === 0) redirect('/cart')

  const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Checkout"
        title="Checkout"
        description="Demo checkout — no payment will be processed."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <CheckoutForm defaultName={user.name ?? ''} defaultEmail={user.email} />

        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 text-ui">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {item.name} × {formatNumber(item.quantity)}
                  </span>
                  <span>{formatCurrency(item.priceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border pt-3 font-medium">
              <span>Total</span>
              <span>{formatCurrency(totalCents)}</span>
            </div>
            <p className="text-caption text-subtle-foreground">
              Placing the order reserves stock immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
