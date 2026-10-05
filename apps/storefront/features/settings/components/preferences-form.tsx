'use client'

import type { FormState, UserPreferences } from '@repo/types'
import { Button, Checkbox, Label } from '@repo/ui'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { updatePreferencesAction } from '@/features/settings/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save preferences'}
    </Button>
  )
}

export interface PreferencesFormProps {
  preferences: UserPreferences
}

export function PreferencesForm({ preferences }: PreferencesFormProps) {
  const [state, formAction] = useActionState(updatePreferencesAction, {
    status: 'idle',
  } as FormState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.status === 'success' && (
        <div
          role="status"
          className="rounded-md border border-success/20 bg-success/5 px-3.5 py-2.5 text-small text-success"
        >
          {state.message}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="productUpdates"
            name="productUpdates"
            defaultChecked={preferences.productUpdates}
          />
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="productUpdates">Product updates</Label>
            <p className="text-small text-muted-foreground">
              Occasional emails about new features in this starter.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="weeklyDigest"
            name="weeklyDigest"
            defaultChecked={preferences.weeklyDigest}
          />
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="weeklyDigest">Weekly digest</Label>
            <p className="text-small text-muted-foreground">
              A short weekly summary of activity on your account.
            </p>
          </div>
        </div>
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
