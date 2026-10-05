'use server'

import { requirePermission } from '@repo/auth'
import { createCategory, deleteCategory } from '@repo/db'
import { INITIAL_FORM_STATE, PERMISSIONS, type FormState } from '@repo/types'
import { slugify } from '@repo/utils'
import { revalidatePath } from 'next/cache'

const GUARD_OPTIONS = { loginPath: '/login', forbiddenPath: '/forbidden' }

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  )
}

export async function createCategoryAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, GUARD_OPTIONS)

  const name = String(formData.get('name') ?? '').trim()
  if (name.length < 1 || name.length > 100) {
    return {
      ...INITIAL_FORM_STATE,
      status: 'error',
      message: 'Enter a category name between 1 and 100 characters.',
    }
  }

  const rawSlug = String(formData.get('slug') ?? '').trim()
  const slug = slugify(rawSlug || name)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      ...INITIAL_FORM_STATE,
      status: 'error',
      message: 'Enter a valid slug (lowercase letters, numbers and hyphens).',
    }
  }

  try {
    await createCategory({ name, slug })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ...INITIAL_FORM_STATE,
        status: 'error',
        message: 'A category with this slug already exists.',
      }
    }
    throw error
  }

  revalidatePath('/categories')
  return { ...INITIAL_FORM_STATE, status: 'success', message: 'Category created.' }
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, GUARD_OPTIONS)

  const categoryId = String(formData.get('categoryId') ?? '')
  if (!categoryId) return

  await deleteCategory(categoryId)
  revalidatePath('/categories')
  revalidatePath('/products')
}
