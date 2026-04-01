import { createFileRoute } from '@tanstack/react-router'
import { useAdminOverview } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useAdminOverview()

  if (isLoading) return <div>Loading admin overview...</div>
  if (error) return <div>{error.message}</div>

  const stats = [
    { label: 'Total Users', value: data?.totalUsers ?? 0 },
    { label: 'Total Tenants', value: data?.totalTenants ?? 0 },
    { label: 'Active Tenants', value: data?.activeTenants ?? 0 },
    { label: 'Total Orders', value: data?.totalOrders ?? 0 },
    {
      label: 'Total Revenue',
      value: `$${Number(data?.totalRevenue ?? 0).toLocaleString()}`,
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
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
