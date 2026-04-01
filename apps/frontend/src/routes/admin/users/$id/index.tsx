import { createFileRoute } from '@tanstack/react-router'
import { useAdminUserById } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/users/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data, isLoading, error } = useAdminUserById(id)

  if (isLoading) return <div>Loading user detail...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">User Detail</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            {data?.firstName} {data?.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>ID: {data?.id}</p>
          <p>Email: {data?.email}</p>
          <p>Role: {data?.role}</p>
          <p>Verified: {data?.isVerified ? 'Yes' : 'No'}</p>
          <p>Active: {data?.isActive ? 'Yes' : 'No'}</p>
        </CardContent>
      </Card>
    </div>
  )
}
