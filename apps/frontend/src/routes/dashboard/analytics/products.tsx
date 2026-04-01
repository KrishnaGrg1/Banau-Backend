import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useGetAllProducts } from '@/hooks/use-product'

export const Route = createFileRoute('/dashboard/analytics/products')({
  component: AnalyticsProducts,
})

function AnalyticsProducts() {
  const { data, isLoading, error } = useGetAllProducts({
    limit: 100,
    offset: 0,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) return <div>{error.message}</div>

  const products = data?.data?.existingProducts ?? []
  const active = products.filter((p: any) => p.status === 'ACTIVE').length
  const draft = products.filter((p: any) => p.status === 'DRAFT').length
  const archived = products.filter((p: any) => p.status === 'ARCHIVED').length
  const lowStock = products.filter((p: any) => Number(p.quantity ?? 0) <= 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Product status and stock metrics from real inventory data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{products.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{active}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{draft}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Archived</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{archived}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {lowStock.length === 0 ? (
            <p className="text-muted-foreground">No low-stock products.</p>
          ) : (
            lowStock.slice(0, 12).map((product: any) => (
              <div key={product.id} className="flex justify-between border-b pb-2">
                <span>{product.name}</span>
                <span>{product.quantity}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
