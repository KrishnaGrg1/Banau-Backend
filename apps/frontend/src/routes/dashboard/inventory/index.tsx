import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useGetAllProducts, useGetLowStockProducts } from '@/hooks/use-product'

export const Route = createFileRoute('/dashboard/inventory/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: productsData, isLoading: loadingProducts } = useGetAllProducts({
    limit: 100,
    offset: 0,
  })
  const { data: lowStock, isLoading: loadingLowStock } =
    useGetLowStockProducts(10)

  if (loadingProducts || loadingLowStock) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const products: any[] = Array.isArray(productsData?.data?.existingProducts)
    ? productsData.data.existingProducts
    : []
  const lowStockData = (lowStock as any) ?? {}
  const lowStockList: any[] = Array.isArray(lowStockData.lowStockProducts)
    ? lowStockData.lowStockProducts
    : []
  const totalStock = products.reduce(
    (sum: number, product: any) => sum + Number(product.quantity ?? 0),
    0,
  )
  const outOfStock = products.filter(
    (product: any) => Number(product.quantity) <= 0,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Inventory Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Current stock health from your product records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {products.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalStock}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {lowStockList.length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link
            to="/dashboard/inventory/low-stock"
            className="underline text-sm"
          >
            View low-stock alerts
          </Link>
          <Link
            to="/dashboard/inventory/adjustments"
            className="underline text-sm"
          >
            Open stock adjustments
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Out of Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {outOfStock.length === 0 ? (
            <p className="text-muted-foreground">No out-of-stock products.</p>
          ) : (
            outOfStock.slice(0, 10).map((product: any) => (
              <div
                key={product.id}
                className="flex justify-between border-b pb-2"
              >
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
