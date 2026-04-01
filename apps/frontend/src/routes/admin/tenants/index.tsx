import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useAdminTenants } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SearchTypes } from '@repo/shared'

export const Route = createFileRoute('/admin/tenants/')({
  validateSearch: (search: Record<string, unknown>): SearchTypes => ({
    limit: Number(search?.limit) || 10,
    offset: Number(search?.offset) || 0,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { limit = 10, offset = 0 } = Route.useSearch()
  const { data, isLoading, error } = useAdminTenants({ limit, offset })

  if (isLoading) return <div>Loading tenants...</div>
  if (error) return <div>{error.message}</div>

  const tenants = data?.tenants ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tenants</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {tenants.map((tenant: any) => (
            <div
              key={tenant.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <p className="font-medium">{tenant.name}</p>
                <p className="text-muted-foreground">{tenant.email}</p>
              </div>
              <Link
                to="/admin/tenants/$id"
                params={{ id: tenant.id }}
                className="underline"
              >
                View
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
