'use client'

import type { FormState, ProductStatus } from '@repo/types'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@repo/ui'
import { slugify } from '@repo/utils'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { createProductAction, updateProductAction } from '@/features/products/actions'
import { ImageManager, type ManagedImage } from '@/features/products/components/image-manager'

export interface ProductFormDefaults {
  productId: string
  name: string
  slug: string
  description: string
  priceCents: number
  stock: number
  status: ProductStatus
  categoryId: string | null
  images: ManagedImage[]
}

export interface ProductFormProps {
  mode: 'create' | 'edit'
  categories: { id: string; name: string }[]
  defaultValues?: ProductFormDefaults
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button>
  )
}

export function ProductForm({ mode, categories, defaultValues }: ProductFormProps) {
  const action = mode === 'create' ? createProductAction : updateProductAction
  const [state, formAction] = useActionState(action, { status: 'idle' } as FormState)

  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {mode === 'edit' && defaultValues && (
        <input type="hidden" name="productId" value={defaultValues.productId} />
      )}

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

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            maxLength={200}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value)
              setSlugTouched(true)
            }}
            placeholder="auto-generated from the name"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          maxLength={5000}
          defaultValue={defaultValues?.description ?? ''}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            inputMode="decimal"
            placeholder="0.00"
            defaultValue={defaultValues ? (defaultValues.priceCents / 100).toFixed(2) : undefined}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min={0}
            step={1}
            defaultValue={defaultValues?.stock ?? 0}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select name="status" defaultValue={defaultValues?.status ?? 'draft'}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Category</Label>
        <Select name="categoryId" defaultValue={defaultValues?.categoryId ?? 'none'}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Images</Label>
        <ImageManager initialImages={defaultValues?.images ?? []} />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={mode === 'create' ? 'Create product' : 'Save changes'} />
        <Button type="button" variant="secondary" asChild>
          <Link href="/products">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
