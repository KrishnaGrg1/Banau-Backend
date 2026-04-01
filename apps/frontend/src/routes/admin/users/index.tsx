import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useAdminUsers } from '@/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SearchTypes } from '@repo/shared'

export const Route = createFileRoute('/admin/users/')({
  validateSearch: (search: Record<string, unknown>): SearchTypes => ({
    limit: Number(search?.limit) || 10,
    offset: Number(search?.offset) || 0,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { limit = 10, offset = 0 } = Route.useSearch()
  const { data, isLoading, error } = useAdminUsers({ limit, offset })

  if (isLoading) return <div>Loading users...</div>
  if (error) return <div>{error.message}</div>

  const users = data?.users ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {users.map((user: any) => (
            <div
              key={user.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Link
                to="/admin/users/$id"
                params={{ id: user.id }}
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
