import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getWebsite } from '@/lib/services/website.service'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useEffect } from 'react'
import { useLogOut } from '@/hooks/user-auth'
import { useAuthStore } from '@/lib/stores/auth.stores'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, navigate])

  const {
    data: website,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['website'],
    queryFn: getWebsite,
  })

  const { mutate: logoutMutation } = useLogOut()

  const handleLogout = () => {
    logoutMutation()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
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
            Manage your websites and view analytics
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Your Website</CardTitle>
              <CardDescription>
                {website ? 'Manage your website' : 'Create your first website'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : error ? (
                <div>
                  <p className="mb-4 text-sm text-gray-600">
                    You don't have a website yet
                  </p>
                  <Button onClick={() => navigate({ to: '/website' })}>
                    Create Website
                  </Button>
                </div>
              ) : website ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Subdomain</p>
                    <p className="text-gray-600">{website.subdomain}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p
                      className={
                        website.published ? 'text-green-600' : 'text-gray-600'
                      }
                    >
                      {website.published ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate({ to: '/website' })}
                    className="w-full"
                  >
                    Manage Website
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your website at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Websites</span>
                  <span className="font-medium">{website ? 1 : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Published</span>
                  <span className="font-medium">
                    {website?.published ? 1 : 0}
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
                {!website && (
                  <Button
                    onClick={() => navigate({ to: '/website' })}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Create your first website
                  </Button>
                )}
                {website && (
                  <>
                    <Button
                      onClick={() => navigate({ to: '/website' })}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Edit website
                    </Button>
                    <Button
                      onClick={() =>
                        navigate({ to: `/preview/${website.subdomain}` })
                      }
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Preview site
                    </Button>
                    {website.published && (
                      <Button
                        onClick={() => {
                          window.open(
                            `https://${website.subdomain}.banau.com`,
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
