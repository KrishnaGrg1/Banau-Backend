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
import { Spinner } from '@/components/ui/spinner'
import { useGetMe } from '@/hooks/use-user'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Mail,
  Calendar,
  Globe,
  ExternalLink,
  Plus,
  Settings,
  Eye,
  LogOut,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useEffect } from 'react'

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
  const {
    data: tenant,
    isLoading,
    error,
    refetch: refecthingTenant,
  } = useGetTenant()
  const { user, refetch: refetchingUser } = useGetMe()
  useEffect(() => {
    refecthingTenant
    refetchingUser
  }, [])
  const { mutate: logoutMutation, isPending: isLoggingOut } = useLogOut()

  const handleLogout = () => {
    logoutMutation(undefined)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen">
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card border shadow-lg">
            <Spinner className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Logging out...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Banau</h1>
            <Badge variant="secondary">Dashboard</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section with User Info */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {getInitials(user?.data.firstName, user?.data.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Welcome back, {user?.data.firstName || 'User'}!
                    </h2>
                    <p className="text-muted-foreground">
                      Manage your tenants and monitor your sites
                    </p>
                  </div>
                </div>
                {user?.data.isVerified && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.data.firstName} {user?.data.lastName}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.data.email}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user?.data.createdAt)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user?.data.lastLoginAt)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Account Status</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.data.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  {user?.data.isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Tenant Management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Your Tenant
              </CardTitle>
              <CardDescription>
                {tenant
                  ? 'Manage your website and settings'
                  : 'Create your first tenant to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : error || !tenant ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Tenant Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create your first tenant to start building your website
                  </p>
                  <Button onClick={() => navigate({ to: '/tenant' })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tenant
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{tenant.name}</h3>
                        <Badge
                          variant={tenant.published ? 'default' : 'secondary'}
                        >
                          {tenant.published ? 'Live' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tenant.subdomain}.banau.com
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium mb-1">Subdomain</p>
                      <p className="text-sm text-muted-foreground">
                        {tenant.subdomain}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {tenant.published ? 'Published' : 'Draft'}
                        </p>
                        {tenant.published ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tenant.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tenant.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => navigate({ to: '/tenant' })}
                      variant="default"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Tenant
                    </Button>
                    <Button
                      onClick={() =>
                        navigate({ to: `/preview/${tenant.subdomain}` })
                      }
                      variant="outline"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
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
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Live Site
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        {tenant && (
          <div className="grid gap-6 md:grid-cols-3 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tenants
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Active website</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                {tenant.published ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tenant.published ? 'Live' : 'Draft'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {tenant.published
                    ? 'Your site is live'
                    : 'Publish to go live'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Account Type
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {user?.data.role?.toLowerCase() || 'User'}
                </div>
                <p className="text-xs text-muted-foreground">Member role</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
