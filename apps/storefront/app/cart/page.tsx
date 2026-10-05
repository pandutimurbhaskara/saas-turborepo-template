import { getCartItems } from '@repo/db'
import { getPublicUrl } from '@repo/storage'
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, PageHeader } from '@repo/ui'
import { formatCurrency } from '@repo/utils'
import { ImageIcon, ShoppingBag } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { removeCartItemAction, updateCartItemQuantityAction } from '@/features/cart/actions'
import { getCurrentCart } from '@/lib/cart'

export const metadata: Metadata = {
  title: 'Cart',
}

export default async function CartPage() {
  const cart = await getCurrentCart()
  const items = cart ? await getCartItems(cart.id) : []
  const subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Cart"
        title="Your cart"
        description={
          items.length > 0
            ? `${items.length} line item${items.length === 1 ? '' : 's'} ready for checkout.`
            : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the catalog and add something you like."
          action={
            <Button asChild>
              <Link href="/products">Shop products</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
            {items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-4 p-4">
                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-subtle">
                  {item.imageKey ? (
                    <Image
                      src={getPublicUrl(item.imageKey)}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-4 text-subtle-foreground" />
                  )}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Link
                    href={`/products/${item.slug}`}
                    className="truncate font-medium hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="text-small text-muted-foreground">
                    {formatCurrency(item.priceCents)} each
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <form action={updateCartItemQuantityAction}>
                    <input type="hidden" name="cartItemId" value={item.id} />
                    <input type="hidden" name="quantity" value={item.quantity - 1} />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </Button>
                  </form>
                  <span className="w-8 text-center text-ui">{item.quantity}</span>
                  <form action={updateCartItemQuantityAction}>
                    <input type="hidden" name="cartItemId" value={item.id} />
                    <input type="hidden" name="quantity" value={item.quantity + 1} />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={item.quantity >= item.stock || item.quantity >= 99}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </Button>
                  </form>
                </div>

                <p className="w-24 text-right font-medium">
                  {formatCurrency(item.priceCents * item.quantity)}
                </p>

                <form action={removeCartItemAction}>
                  <input type="hidden" name="cartItemId" value={item.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Remove
                  </Button>
                </form>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 text-ui">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotalCents)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(subtotalCents)}</span>
                </div>
              </div>
              <Button size="lg" asChild>
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
              <p className="text-caption text-subtle-foreground">
                Demo checkout — no payment will be processed.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
