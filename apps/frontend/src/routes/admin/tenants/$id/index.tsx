import { createFileRoute } from '@tanstack/react-router'
import { useAdminTenantById } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/tenants/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data, isLoading, error } = useAdminTenantById(id)

  if (isLoading) return <div>Loading tenant detail...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tenant Detail</h1>
      <Card>
        <CardHeader>
          <CardTitle>{data?.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>ID: {data?.id}</p>
          <p>Email: {data?.email}</p>
          <p>Subdomain: {data?.subdomain}</p>
          <p>Status: {data?.status}</p>
          <p>Plan: {data?.plan}</p>
          <p>Published: {data?.published ? 'Yes' : 'No'}</p>
        </CardContent>
      </Card>
    </div>
  )
}
