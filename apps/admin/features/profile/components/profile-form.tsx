'use client'

import type { FormState } from '@repo/types'
import { Button, Input, Label } from '@repo/ui'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { updateProfileAction } from '@/features/profile/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save changes'}
    </Button>
  )
}

export interface ProfileFormProps {
  defaultName: string
  email: string
}

export function ProfileForm({ defaultName, email }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, {
    status: 'idle',
  } as FormState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-error/20 bg-error/5 px-3.5 py-2.5 text-small text-error"
        >
          {state.message}
        </div>
      )}
      {state.status === 'success' && (
        <div
          role="status"
          className="rounded-md border border-success/20 bg-success/5 px-3.5 py-2.5 text-small text-success"
        >
          {state.message}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Display name</Label>
        <Input id="name" name="name" defaultValue={defaultName} maxLength={100} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled readOnly />
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
