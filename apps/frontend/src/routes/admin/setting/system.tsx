import { createFileRoute } from '@tanstack/react-router'
import { useAdminSystemSettings } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/setting/system')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useAdminSystemSettings()

  if (isLoading) return <div>Loading system settings...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">System Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Environment: {data?.nodeEnv}</p>
          <p>API Version: {data?.apiVersion}</p>
          <p>Uptime: {data?.uptimeInSeconds}s</p>
          <p>Server Time: {data?.serverTime}</p>
        </CardContent>
      </Card>
    </div>
  )
}
