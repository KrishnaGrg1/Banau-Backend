import { createFileRoute } from '@tanstack/react-router'
import { useAdminAnalyticsOverview } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/analytics/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useAdminAnalyticsOverview()

  if (isLoading) return <div>Loading analytics overview...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User By Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(data?.userByRole ?? []).map((item: any) => (
              <div key={item.role} className="flex justify-between">
                <span>{item.role}</span>
                <span>{item._count._all}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenants By Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(data?.tenantsByStatus ?? []).map((item: any) => (
              <div key={item.status} className="flex justify-between">
                <span>{item.status}</span>
                <span>{item._count._all}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders By Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(data?.ordersByStatus ?? []).map((item: any) => (
              <div key={item.status} className="flex justify-between">
                <span>{item.status}</span>
                <span>{item._count._all}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(data?.monthlyRevenue ?? []).map((item: any) => (
            <div key={item.month} className="flex justify-between">
              <span>{item.month}</span>
              <span>${Number(item.total ?? 0).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
