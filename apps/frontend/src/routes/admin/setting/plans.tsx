import { createFileRoute } from '@tanstack/react-router'
import { useAdminPlanManagement } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/setting/plans')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useAdminPlanManagement()

  if (isLoading) return <div>Loading plans...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Plan Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(data?.availablePlans ?? []).map((plan: string) => (
            <div key={plan} className="border-b pb-2">
              {plan}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenants By Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(data?.tenantsByPlan ?? []).map((item: any) => (
            <div key={item.plan} className="flex justify-between border-b pb-2">
              <span>{item.plan}</span>
              <span>{item._count._all}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
