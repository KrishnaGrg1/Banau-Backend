import { createFileRoute } from '@tanstack/react-router'
import { useAdminRevenueMetrics } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/analytics/revenue')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useAdminRevenueMetrics()

  if (isLoading) return <div>Loading revenue metrics...</div>
  if (error) return <div>{error.message}</div>

  const stats = [
    {
      label: 'Revenue Today',
      value: `$${Number(data?.revenueToday ?? 0).toLocaleString()}`,
    },
    {
      label: 'Revenue 7 Days',
      value: `$${Number(data?.revenue7Days ?? 0).toLocaleString()}`,
    },
    {
      label: 'Revenue 30 Days',
      value: `$${Number(data?.revenue30Days ?? 0).toLocaleString()}`,
    },
    { label: 'Paid Orders 30 Days', value: data?.paidOrders30Days ?? 0 },
    {
      label: 'AOV 30 Days',
      value: `$${Number(data?.averageOrderValue30Days ?? 0).toLocaleString()}`,
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Revenue Metrics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stat.value}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
