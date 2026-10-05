'use client'

import type { FormState } from '@repo/types'
import { Button, Input, Label } from '@repo/ui'
import { slugify } from '@repo/utils'
import { useActionState, useRef } from 'react'
import { useFormStatus } from 'react-dom'

import { createCategoryAction } from '@/features/categories/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating…' : 'Create category'}
    </Button>
  )
}

export function CategoryForm() {
  const [state, formAction] = useActionState(createCategoryAction, {
    status: 'idle',
  } as FormState)

  const slugRef = useRef<HTMLInputElement>(null)
  const slugTouchedRef = useRef(false)

  return (
    <form action={formAction} className="flex flex-col gap-4">
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

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category-name">Name</Label>
          <Input
            id="category-name"
            name="name"
            maxLength={100}
            required
            onChange={(event) => {
              if (!slugTouchedRef.current && slugRef.current) {
                slugRef.current.value = slugify(event.target.value)
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category-slug">Slug</Label>
          <Input
            id="category-slug"
            name="slug"
            ref={slugRef}
            placeholder="auto-generated from the name"
            onChange={() => {
              slugTouchedRef.current = true
            }}
          />
        </div>
        <SubmitButton />
      </div>
    </form>
  )
}
