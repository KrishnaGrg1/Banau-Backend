import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useOrders } from '@/hooks/use-order'
import { useGetAllProducts } from '@/hooks/use-product'
import { useListAllCustomers } from '@/hooks/use-customer'
import { formatNprCurrency } from '@/lib/currency'

export const Route = createFileRoute('/dashboard/analytics/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: ordersData, isLoading: loadingOrders } = useOrders({
    limit: 100,
    offset: 0,
  })
  const { data: productsData, isLoading: loadingProducts } = useGetAllProducts({
    limit: 100,
    offset: 0,
  })
  const { data: customersData, isLoading: loadingCustomers } =
    useListAllCustomers({ limit: 100, offset: 0 })

  const orders = ordersData?.data?.orders ?? []
  const productsRaw = productsData?.data?.existingProducts
  const products = Array.isArray(productsRaw) ? productsRaw : []
  const customers = customersData?.data?.customers ?? []

  const totalRevenue = orders.reduce(
    (sum: number, order: any) => sum + Number(order.total ?? 0),
    0,
  )

  const orderByStatus = orders.reduce(
    (acc: Record<string, number>, order: any) => {
      const key = order.status || 'UNKNOWN'
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {},
  )

  const lowStockProducts = products.filter(
    (p: any) => Number(p.quantity ?? 0) <= 10,
  )

  const isLoading = loadingOrders || loadingProducts || loadingCustomers

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Live metrics from orders, products, and customers.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {formatNprCurrency(totalRevenue)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {ordersData?.data?.meta?.total ?? 0}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {productsData?.data?.meta?.total ?? 0}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Customers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {customersData?.data?.meta?.total ?? 0}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {Object.entries(orderByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between border-b pb-2"
                  >
                    <span>{status}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {lowStockProducts.length === 0 ? (
                  <p className="text-muted-foreground">
                    No low-stock products.
                  </p>
                ) : (
                  lowStockProducts.slice(0, 10).map((product: any) => (
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

          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {customers.slice(0, 8).map((customer: any) => (
                <div
                  key={customer.id}
                  className="flex justify-between border-b pb-2"
                >
                  <span>
                    {customer.firstName} {customer.lastName}
                  </span>
                  <span>
                    {formatNprCurrency(Number(customer.totalSpent ?? 0))}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
