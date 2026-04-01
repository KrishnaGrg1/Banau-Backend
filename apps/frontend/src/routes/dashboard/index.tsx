import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGetTenant } from '@/hooks/use-tenant'
import { Spinner } from '@/components/ui/spinner'
import { useGetMe } from '@/hooks/use-user'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useOrders } from '@/hooks/use-order'
import { useGetAllProducts } from '@/hooks/use-product'
import { useListAllCustomers } from '@/hooks/use-customer'
import { formatNprCurrency } from '@/lib/currency'
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
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ArrowUpRight,
  Activity,
  BarChart3,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { data: tenant, isLoading: loadingTenant, error } = useGetTenant()
  const { user } = useGetMe()

  const { data: ordersData, isLoading: loadingOrders } = useOrders({
    limit: 100,
    offset: 0,
  })
  const { data: productsData, isLoading: loadingProducts } = useGetAllProducts({
    limit: 100,
    offset: 0,
  })
  const { data: customersData, isLoading: loadingCustomers } =
    useListAllCustomers({ limit: 100, offset: 0 })

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

  const orders = ordersData?.data?.orders ?? []
  const recentOrders = [...orders]
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3)

  const totalRevenue = orders.reduce(
    (sum: number, order: any) => sum + Number(order.total ?? 0),
    0,
  )

  const stats = {
    revenue: { value: formatNprCurrency(totalRevenue) },
    orders: { value: String(ordersData?.data?.meta?.total ?? 0) },
    customers: { value: String(customersData?.data?.meta?.total ?? 0) },
    products: { value: String(productsData?.data?.meta?.total ?? 0) },
  }

  const isLoading =
    loadingTenant || loadingOrders || loadingProducts || loadingCustomers

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.data.firstName || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        {user?.data.isVerified && (
          <Badge variant="default" className="gap-1.5 h-fit">
            <CheckCircle2 className="h-3 w-3" />
            Verified Account
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <div className="h-9 w-9 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.revenue.value}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
                <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orders.value}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </CardTitle>
                <div className="h-9 w-9 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.customers.value}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
                <div className="h-9 w-9 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products.value}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Your Store
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {tenant
                        ? 'Manage your store and settings'
                        : 'Get started by creating your store'}
                    </CardDescription>
                  </div>
                  {tenant && (
                    <Badge
                      variant={tenant.published ? 'default' : 'secondary'}
                      className="gap-1.5"
                    >
                      {tenant.published ? (
                        <>
                          <Activity className="h-3 w-3" />
                          Live
                        </>
                      ) : (
                        'Draft'
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {error || !tenant ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 gap-4 bg-muted/30 rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Globe className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">No Store Yet</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Create your first store to start selling online.
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate({ to: '/dashboard/tenants' })}
                      size="lg"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your Store
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{tenant.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5" />
                          {tenant.subdomain}.banau.com
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Subdomain
                        </p>
                        <p className="mt-1.5 font-medium">{tenant.subdomain}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Status
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              tenant.published ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          <span className="font-medium">
                            {tenant.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Created
                        </p>
                        <p className="mt-1.5 font-medium">
                          {formatDate(tenant.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Last Updated
                        </p>
                        <p className="mt-1.5 font-medium">
                          {formatDate(tenant.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => navigate({ to: '/dashboard/tenants' })}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Store
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate({ to: `/s/${tenant.subdomain}` })
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      {tenant.published && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `https://${tenant.subdomain}.banau.com`,
                              '_blank',
                            )
                          }
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

            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-primary/10">
                      <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
                        {getInitials(user?.data.firstName, user?.data.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {user?.data.firstName} {user?.data.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user?.data.email}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                      <span className="font-medium">{user?.data.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Member Since</span>
                      </div>
                      <span className="font-medium">
                        {formatDate(user?.data.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span>Status</span>
                      </div>
                      <Badge
                        variant={user?.data.isActive ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {user?.data.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No recent order activity.
                      </p>
                    ) : (
                      recentOrders.map((order: any) => (
                        <div
                          key={order.id}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              Order #{order.id.slice(0, 8)} • {order.status}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatNprCurrency(Number(order.total ?? 0))}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Quick Access</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your store essentials
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/dashboard/analytics' })}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                <div onClick={() => navigate({ to: '/dashboard/products' })}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-base">Products</CardTitle>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Add, edit, or remove products from your store inventory.
                    </p>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Total Products
                        </span>
                        <span className="font-semibold">
                          {stats.products.value}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                <div onClick={() => navigate({ to: '/dashboard/orders' })}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ClipboardList className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-base">Orders</CardTitle>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track, process, and manage all customer orders.
                    </p>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Total Orders
                        </span>
                        <span className="font-semibold">
                          {stats.orders.value}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                <div onClick={() => navigate({ to: '/dashboard/settings' })}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Settings className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-base">Settings</CardTitle>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Configure your store's appearance and preferences.
                    </p>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Last Updated
                        </span>
                        <span className="font-semibold">
                          {tenant ? formatDate(tenant.updatedAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
