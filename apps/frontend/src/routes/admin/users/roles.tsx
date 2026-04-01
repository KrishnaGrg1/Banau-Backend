import { createFileRoute } from '@tanstack/react-router'
import { useAdminUserRoles } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/users/roles')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useAdminUserRoles()

  if (isLoading) return <div>Loading roles...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">User Role Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Available Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(data?.roles ?? []).map((role: string) => (
            <div key={role} className="border-b pb-2">
              {role}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
