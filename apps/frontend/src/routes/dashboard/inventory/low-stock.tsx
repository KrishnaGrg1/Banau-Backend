import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useGetLowStockProducts } from '@/hooks/use-product'

export const Route = createFileRoute('/dashboard/inventory/low-stock')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useGetLowStockProducts(10)
  const lowStockData = (data as any) ?? {}
  const lowStockProducts: any[] = Array.isArray(lowStockData.lowStockProducts)
    ? lowStockData.lowStockProducts
    : []
  const productsWithLowVariants: any[] = Array.isArray(
    lowStockData.productsWithLowVariants,
  )
    ? lowStockData.productsWithLowVariants
    : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) return <div>{error.message}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Products with quantity less than or equal to 10.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {lowStockProducts.length === 0 ? (
            <p className="text-muted-foreground">No low-stock products.</p>
          ) : (
            lowStockProducts.map((product: any) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {productsWithLowVariants.length === 0 ? (
            <p className="text-muted-foreground">No low-stock variants.</p>
          ) : (
            productsWithLowVariants.map((product: any) => (
              <div key={product.id} className="border-b pb-2">
                <p className="font-medium">{product.name}</p>
                <p className="text-muted-foreground text-xs">
                  {product.variants?.length ?? 0} low-stock variant(s)
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
