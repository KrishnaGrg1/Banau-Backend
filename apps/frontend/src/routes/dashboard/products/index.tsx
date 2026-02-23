// apps/web/app/routes/dashboard/products/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useGetAllProducts } from '@/hooks/use-product'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { ProductDto } from '@repo/shared'
import { BulkImportDialog } from '@/components/dashboard/products/bulk-import-dialog'
import { ExportButton } from '@/components/dashboard/products/export-button'
import { ProductActionsMenu } from '@/components/dashboard/products/delete-product'

// ✅ Define search params for pagination
interface ProductsSearch {
  limit?: number
  offset?: number
}

export const Route = createFileRoute('/dashboard/products/')({
  // ✅ Validate search params
  validateSearch: (search: Record<string, unknown>): ProductsSearch => ({
    limit: Number(search?.limit) || 10,
    offset: Number(search?.offset) || 0,
  }),

  // ✅ Optional: Pre-load data on server (SSR/initial load)
  // This makes the page load faster with data already there
  // loader: async ({ context }) => {
  //   const products = await getAllProducts({
  //     data: { limit: 10, offset: 0 }
  //   })
  //   return { products }
  // },

  component: ProductsPage,
})

export default function ProductsPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()
  // const [open, setOpen] = useState(false)

  // ✅ Use search params for pagination
  const limit = search.limit || 10
  const offset = search.offset || 0

  // ✅ Fetch products with current pagination
  const { data, isLoading, error } = useGetAllProducts({
    limit,
    offset,
  })
  const products: ProductDto[] = Array.isArray(data?.data?.existingProducts)
    ? data.data.existingProducts
    : []
  const meta = data?.data?.meta

  // ✅ Calculate current page
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  // ✅ Handle pagination
  const handleNextPage = () => {
    if (meta?.hasNextPage) {
      navigate({
        search: {
          limit,
          offset: offset + limit,
        },
      })
    }
  }

  const handlePrevPage = () => {
    if (meta?.hasPreviousPage) {
      navigate({
        search: {
          limit,
          offset: Math.max(0, offset - limit),
        },
      })
    }
  }

  const handleLimitChange = (newLimit: number) => {
    navigate({
      search: {
        limit: newLimit,
        offset: 0, // Reset to first page
      },
    })
  }

  const formatPrice = (price: string) => {
    return `Rs${parseFloat(price).toFixed(2)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'DRAFT':
        return 'secondary'
      case 'ARCHIVED':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog
          </p>
        </div>

        <div className="flex items-center gap-2">
          <BulkImportDialog />
          <ExportButton />

          <Button onClick={() => navigate({ to: '/dashboard/products/new' })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      {meta && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meta.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Page
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentPage} / {totalPages}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Showing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {offset + 1}-{Math.min(offset + limit, meta.total)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Products</CardTitle>

            {/* Per Page Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => handleLimitChange(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No products yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Get started by creating your first product
              </p>
              <Button
                onClick={() => navigate({ to: '/dashboard/products/new' })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.featuredImage?.url ? (
                            // <div className="h-10 w-10 rounded border bg-muted" />
                            <img
                              src={product.featuredImage?.url}
                              className="h-10 rounded border "
                            />
                          ) : (
                            <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {product.sku || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(product.price)}
                        </div>
                        {product.compareAtPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.compareAtPrice)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            product.quantity === 0
                              ? 'text-red-600 font-medium'
                              : product.quantity < 10
                                ? 'text-orange-600 font-medium'
                                : ''
                          }
                        >
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ProductActionsMenu
                          id={product.id}
                          name={product.name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.total > limit && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {offset + 1} to{' '}
                    {Math.min(offset + limit, meta.total)} of {meta.total}{' '}
                    results
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={!meta.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!meta.hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
