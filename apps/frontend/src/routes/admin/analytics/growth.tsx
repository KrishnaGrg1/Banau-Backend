import { createFileRoute } from '@tanstack/react-router'
import { useAdminGrowthMetrics } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/analytics/growth')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useAdminGrowthMetrics()

  if (isLoading) return <div>Loading growth metrics...</div>
  if (error) return <div>{error.message}</div>

  const items = [
    {
      label: 'Users',
      value: data?.users?.current,
      growth: data?.users?.growthPercent,
    },
    {
      label: 'Tenants',
      value: data?.tenants?.current,
      growth: data?.tenants?.growthPercent,
    },
    {
      label: 'Customers',
      value: data?.customers?.current,
      growth: data?.customers?.growthPercent,
    },
    {
      label: 'Orders',
      value: data?.orders?.current,
      growth: data?.orders?.growthPercent,
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Growth Metrics</h1>
      <p className="text-sm text-muted-foreground">
        Period: {data?.period?.from} to {data?.period?.to}
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold">{item.value ?? 0}</div>
              <div className="text-sm">{item.growth ?? 0}%</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
