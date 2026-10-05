'use client'

import type { FormState } from '@repo/types'
import { Button, Input, Label } from '@repo/ui'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { placeOrderAction } from '@/features/checkout/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? 'Placing order…' : 'Place order'}
    </Button>
  )
}

export interface CheckoutFormProps {
  defaultName: string
  defaultEmail: string
}

export function CheckoutForm({ defaultName, defaultEmail }: CheckoutFormProps) {
  const [state, formAction] = useActionState(placeOrderAction, { status: 'idle' } as FormState)

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-error/20 bg-error/5 px-3.5 py-2.5 text-small text-error"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            defaultValue={defaultName}
            maxLength={200}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaultEmail}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="line1">Address</Label>
        <Input id="line1" name="line1" autoComplete="address-line1" maxLength={300} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
        <Input id="line2" name="line2" autoComplete="address-line2" maxLength={300} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" autoComplete="address-level2" maxLength={120} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="region">State / region (optional)</Label>
          <Input id="region" name="region" autoComplete="address-level1" maxLength={120} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input
            id="postalCode"
            name="postalCode"
            autoComplete="postal-code"
            maxLength={40}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" autoComplete="country-name" maxLength={120} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SubmitButton />
        <p className="text-caption text-subtle-foreground">
          Demo checkout — no payment will be processed and no card details are collected.
        </p>
      </div>
    </form>
  )
}
