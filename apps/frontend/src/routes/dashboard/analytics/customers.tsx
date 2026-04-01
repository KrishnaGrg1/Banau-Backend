import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useListAllCustomers } from '@/hooks/use-customer'
import { formatNprCurrency } from '@/lib/currency'

export const Route = createFileRoute('/dashboard/analytics/customers')({
  component: AnalyticsCustomers,
})

function AnalyticsCustomers() {
  const { data, isLoading, error } = useListAllCustomers({
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

  const customers = data?.data?.customers ?? []
  const totalSpent = customers.reduce(
    (sum: number, customer: any) => sum + Number(customer.totalSpent ?? 0),
    0,
  )

  const topCustomers = [...customers]
    .sort(
      (a: any, b: any) => Number(b.totalSpent ?? 0) - Number(a.totalSpent ?? 0),
    )
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Customer Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Customer value and engagement based on real customer records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {customers.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatNprCurrency(totalSpent)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Avg Spend
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatNprCurrency(
              customers.length ? totalSpent / customers.length : 0,
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Spend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {topCustomers.map((customer: any) => (
            <div
              key={customer.id}
              className="flex justify-between border-b pb-2"
            >
              <span>
                {customer.firstName} {customer.lastName}
              </span>
              <span>{formatNprCurrency(Number(customer.totalSpent ?? 0))}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
