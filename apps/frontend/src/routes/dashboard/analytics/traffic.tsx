import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useOrders } from '@/hooks/use-order'
import { useListAllCustomers } from '@/hooks/use-customer'

export const Route = createFileRoute('/dashboard/analytics/traffic')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: ordersData, isLoading: loadingOrders, error: ordersError } =
    useOrders({ limit: 100, offset: 0 })
  const {
    data: customersData,
    isLoading: loadingCustomers,
    error: customersError,
  } = useListAllCustomers({ limit: 100, offset: 0 })

  if (loadingOrders || loadingCustomers) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (ordersError) return <div>{ordersError.message}</div>
  if (customersError) return <div>{customersError.message}</div>

  const orders = ordersData?.data?.orders ?? []
  const customers = customersData?.data?.customers ?? []

  const dailyOrders = orders.reduce((acc: Record<string, number>, order: any) => {
    const day = new Date(order.createdAt).toISOString().slice(0, 10)
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Traffic Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Basic traffic proxy from order/customer activity currently stored.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Orders Tracked</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{orders.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Customers Tracked</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{customers.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Days</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {Object.keys(dailyOrders).length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders by Day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {Object.entries(dailyOrders)
            .sort(([a], [b]) => (a > b ? -1 : 1))
            .slice(0, 14)
            .map(([day, count]) => (
              <div key={day} className="flex justify-between border-b pb-2">
                <span>{day}</span>
                <span>{count}</span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
