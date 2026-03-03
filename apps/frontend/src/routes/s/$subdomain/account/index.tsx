import { createFileRoute, Link } from '@tanstack/react-router'
import { useCustomerOrders, useMyProfile } from '@/hooks/use-customer'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import {
  ShoppingBag,
  ChevronRight,
  Package,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import type { OrderDto } from '@repo/shared'

export const Route = createFileRoute('/s/$subdomain/account/')({
  component: AccountDashboard,
})

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50  text-amber-700  border-amber-200',
  PROCESSING: 'bg-blue-50   text-blue-700   border-blue-200',
  SHIPPED: 'bg-violet-50 text-violet-700 border-violet-200',
  DELIVERED: 'bg-green-50  text-green-700  border-green-200',
  CANCELLED: 'bg-red-50    text-red-700    border-red-200',
}

function AccountDashboard() {
  const { subdomain } = Route.useParams()
  const { data: profileRes } = useMyProfile()
  const { data: ordersRes, isLoading: ordersLoading } = useCustomerOrders({
    limit: 50,
  })

  const profile = profileRes?.data
  const allOrders: OrderDto[] = ordersRes?.data?.orders ?? []
  const recentOrders = allOrders.slice(0, 5)
  const lastOrder = allOrders[0]

  const totalSpent = allOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.total ?? 0), 0)

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hello, {profile?.firstName} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Orders
            </p>
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold">{allOrders.length}</p>
          <p className="text-xs text-muted-foreground mt-1">total placed</p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Spent
            </p>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">excl. cancelled</p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Last order
            </p>
            <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-violet-600" />
            </div>
          </div>
          {lastOrder ? (
            <>
              <p className="text-base font-bold truncate">
                #{lastOrder.id.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(lastOrder.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold">—</p>
              <p className="text-xs text-muted-foreground mt-1">
                no orders yet
              </p>
            </>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Recent Orders</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs h-7 gap-1"
          >
            <Link to="/s/$subdomain/account/orders/" params={{ subdomain }}>
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <Separator />

        {ordersLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-5">
              Your orders will appear here once you make a purchase.
            </p>
            <Button size="sm" asChild>
              <Link to="/s/$subdomain" params={{ subdomain }}>
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to="/s/$subdomain/account/orders/$id"
                params={{ subdomain, id: order.id }}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    {' · '}
                    {order.items?.length ?? 0} item
                    {(order.items?.length ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span
                    className={`hidden sm:inline-flex text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                      STATUS_STYLES[order.status] ??
                      'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-sm">
                    ${Number(order.total).toFixed(2)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
