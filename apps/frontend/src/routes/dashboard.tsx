import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useLogOut } from '@/hooks/user-auth'
import { AuthMiddleware, getServerData } from '@/utils/middleware'
import { useGetTenant } from '@/hooks/use-tenant'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    const data = await getServerData()
    return data
  },
  server: {
    middleware: [AuthMiddleware],
  },
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { data: tenant, isLoading, error, refetch } = useGetTenant()
  useEffect(() => {
    refetch
  }, [])
  console.log('theant', tenant)
  const { mutate: logoutMutation, isPending: isLoggingOut } = useLogOut()

  const handleLogout = () => {
    logoutMutation(undefined)
  }

  return (
    <div className="min-h-screen ">
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card border shadow-lg">
            <Spinner className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Logging Out ..
            </p>
          </div>
        </div>
      )}
      <header className="border-b ">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Banau Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">Welcome back!</h2>
          <p className="text-gray-600">
            Manage your tenants and view analytics
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Your Tenant</CardTitle>
              <CardDescription>
                {tenant ? 'Manage your tenant' : 'Create your first tenant'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : error ? (
                <div>
                  <p className="mb-4 text-sm text-gray-600">
                    You don't have a tenant yet
                  </p>
                  <Button onClick={() => navigate({ to: '/tenant' })}>
                    Create tenant
                  </Button>
                </div>
              ) : tenant ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Subdomain</p>
                    <p className="text-gray-600">{tenant.subdomain}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p
                      className={
                        tenant.published ? 'text-green-600' : 'text-gray-600'
                      }
                    >
                      {tenant.published ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate({ to: '/tenant' })}
                    className="w-full"
                  >
                    Manage tenant
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your tenant at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total tenants</span>
                  <span className="font-medium">{tenant ? 1 : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Published</span>
                  <span className="font-medium">
                    {tenant?.published ? 1 : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Quick actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {!tenant && (
                  <Button
                    onClick={() => navigate({ to: '/tenant' })}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Create your first tenant
                  </Button>
                )}
                {tenant && (
                  <>
                    <Button
                      onClick={() => navigate({ to: '/tenant' })}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Edit tenant
                    </Button>
                    <Button
                      onClick={() =>
                        navigate({ to: `/preview/${tenant.subdomain}` })
                      }
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Preview site
                    </Button>
                    {tenant.published && (
                      <Button
                        onClick={() => {
                          window.open(
                            `https://${tenant.subdomain}.banau.com`,
                            '_blank',
                          )
                        }}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        View live site
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
