import { requireApplicationAccess } from '@repo/auth'
import { listCategoriesWithCounts } from '@repo/db'
import {
  Button,
  EmptyState,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { formatNumber } from '@repo/utils'
import { Tags } from 'lucide-react'
import type { Metadata } from 'next'

import { deleteCategoryAction } from '@/features/categories/actions'
import { CategoryForm } from '@/features/categories/components/category-form'

export const metadata: Metadata = {
  title: 'Categories',
}

export default async function AdminCategoriesPage() {
  await requireApplicationAccess('admin', { loginPath: '/login', forbiddenPath: '/forbidden' })

  const categories = await listCategoriesWithCounts()

  return (
    <div className="mx-auto flex max-w-site flex-col gap-8 px-6 py-12">
      <PageHeader
        overline="Catalog"
        title="Categories"
        description="Group products so shoppers can browse by collection."
      />

      <CategoryForm />

      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create a category to organise the catalog."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell>{formatNumber(category.productCount)}</TableCell>
                <TableCell className="text-right">
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="categoryId" value={category.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Delete
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
