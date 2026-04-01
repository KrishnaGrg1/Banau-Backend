import { createFileRoute } from '@tanstack/react-router'
import { useAdminFeatureFlags } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/setting/features')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useAdminFeatureFlags()

  if (isLoading) return <div>Loading feature flags...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Feature Flags</h1>
      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(data?.features ?? []).map((feature: any) => (
            <div
              key={feature.key}
              className="flex justify-between border-b pb-2"
            >
              <span>{feature.key}</span>
              <span>{feature.enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
