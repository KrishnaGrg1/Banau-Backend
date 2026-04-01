import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useOrders } from '@/hooks/use-order'
import { formatNprCurrency } from '@/lib/currency'

export const Route = createFileRoute('/dashboard/analytics/sales')({
  component: AnalyticsSales,
})

function AnalyticsSales() {
  const { data, isLoading, error } = useOrders({ limit: 100, offset: 0 })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) return <div>{error.message}</div>

  const orders = data?.data?.orders ?? []
  const salesByStatus = orders.reduce(
    (acc: Record<string, { count: number; total: number }>, order: any) => {
      const key = order.status || 'UNKNOWN'
      if (!acc[key]) acc[key] = { count: 0, total: 0 }
      acc[key].count += 1
      acc[key].total += Number(order.total ?? 0)
      return acc
    },
    {},
  )

  const totalRevenue = orders.reduce(
    (sum: number, order: any) => sum + Number(order.total ?? 0),
    0,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Sales performance from real orders data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            {orders.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatNprCurrency(
              orders.length ? totalRevenue / orders.length : 0,
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {Object.entries(salesByStatus).map(([status, summary]) => (
            <div key={status} className="flex justify-between border-b pb-2">
              <span>{status}</span>
              <span>
                {summary.count} orders • {formatNprCurrency(summary.total)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
