'use client'

import type { FormState } from '@repo/types'
import { Button, Input, Label } from '@repo/ui'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { loginAction } from '@/features/auth/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  )
}

export interface LoginFormProps {
  next?: string
}

export function LoginForm({ next }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, {
    status: 'idle',
  } as FormState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}
      {state.status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-error/20 bg-error/5 px-3.5 py-2.5 text-small text-error"
        >
          {state.message}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@example.com"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <SubmitButton />
    </form>
  )
}
