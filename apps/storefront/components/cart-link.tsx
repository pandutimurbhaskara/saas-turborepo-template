import { getCartItemCount } from '@repo/db'
import { Button } from '@repo/ui'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

import { getCurrentCart } from '@/lib/cart'

export async function CartLink() {
  const cart = await getCurrentCart()
  const count = cart ? await getCartItemCount(cart.id) : 0

  return (
    <Button variant="ghost" size="sm" className="relative" asChild>
      <Link href="/cart" aria-label={count > 0 ? `Cart, ${count} item(s)` : 'Cart'}>
        <ShoppingBag />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium leading-none text-primary-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Link>
    </Button>
  )
}
