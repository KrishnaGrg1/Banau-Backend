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
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ClipboardList,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
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
  const { data: tenant, isLoading, error } = useGetTenant()
  const { user } = useGetMe()
  const { isPending: isLoggingOut } = useLogOut()

  const getInitials = (firstName?: string, lastName?: string) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      {/* Logout overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in">
          <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card border shadow-lg">
            <Spinner className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Logging out...
            </p>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good day, {user?.data.firstName || 'User'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        {user?.data.isVerified && (
          <Badge variant="default" className="gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant ? 1 : 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tenant ? 'Running smoothly' : 'No sites yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Publish Status
            </CardTitle>
            {tenant?.published ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenant ? (tenant.published ? 'Live' : 'Draft') : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tenant?.published
                ? 'Your site is publicly visible'
                : tenant
                  ? 'Publish to go live'
                  : 'Create a tenant first'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {user?.data.role
                ?.toLowerCase()
                .split('_')
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
                )
                .join(' ') || '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Account type</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenant + Profile */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Tenant Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Your Tenant
            </CardTitle>
            <CardDescription>
              {tenant
                ? 'Manage your site and its settings'
                : 'Get started by creating your first tenant'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : error || !tenant ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Globe className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">No Tenant Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first tenant to start building
                  </p>
                </div>
                <Button onClick={() => navigate({ to: '/dashboard/tenants' })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Tenant
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{tenant.name}</h3>
                      <Badge
                        variant={tenant.published ? 'default' : 'secondary'}
                      >
                        {tenant.published ? 'Live' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {tenant.subdomain}.banau.com
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Subdomain
                    </p>
                    <p className="mt-0.5">{tenant.subdomain}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Status</p>
                    <p className="mt-0.5">
                      {tenant.published ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Created</p>
                    <p className="mt-0.5">{formatDate(tenant.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="mt-0.5">{formatDate(tenant.updatedAt)}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => navigate({ to: '/dashboard/tenants' })}
                    size="sm"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: `/s/${tenant.subdomain}` })}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  {tenant.published && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://${tenant.subdomain}.banau.com`,
                          '_blank',
                        )
                      }
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Live
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {getInitials(user?.data.firstName, user?.data.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">
                  {user?.data.firstName} {user?.data.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.data.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="truncate">{user?.data.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs">Member Since</p>
                  <p>{formatDate(user?.data.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs">Last Login</p>
                  <p>{formatDate(user?.data.lastLoginAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user?.data.isActive ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p>{user?.data.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>

            <Separator />

            <Button variant="outline" size="sm" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card
            className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
            onClick={() => navigate({ to: '/dashboard/products' })}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm">Products</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Add, edit, or remove products from your store.
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
            onClick={() => navigate({ to: '/dashboard/orders' })}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm">Orders</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Track and process customer orders.
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
            onClick={() => navigate({ to: '/dashboard/settings' })}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm">Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Update your store's appearance and configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
