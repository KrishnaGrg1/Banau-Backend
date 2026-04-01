import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useGetCustomerById,
  useGetCustomerOrdersById,
} from '@/hooks/use-customer'
import { OrderDto, OrderStatus, SearchTypes } from '@repo/shared'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Clock,
  Package,
  ChevronRight,
  User,
  Pencil,
  ChevronLeft,
  DollarSign,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/customers/$id/')({
  validateSearch: (search: Record<string, unknown>): SearchTypes => ({
    limit: Number(search?.limit) || 10,
    offset: Number(search?.offset) || 0,
  }),
  component: RouteComponent,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: Date | string | null | undefined, fallback = '—') {
  if (!d) return fallback
  try {
    return format(new Date(d), 'MMM d, yyyy')
  } catch {
    return fallback
  }
}

function fmtCurrency(v: string | null | undefined) {
  if (!v) {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 2,
    }).format(0)
  }

  const num = parseFloat(v)

  return isNaN(num)
    ? v
    : new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
        maximumFractionDigits: 2,
      }).format(num)
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; dot: string }
> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-warning-subtle text-warning ring-warning-muted',
    dot: 'bg-warning',
  },
  PAID: {
    label: 'Paid',
    color: 'bg-info-subtle text-info ring-info-muted',
    dot: 'bg-info',
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-accent-subtle text-accent ring-accent-muted',
    dot: 'bg-accent',
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-primary-subtle text-primary ring-primary-muted',
    dot: 'bg-primary',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-success-subtle text-success ring-success-muted',
    dot: 'bg-success',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-danger-subtle text-danger ring-danger-muted',
    dot: 'bg-danger',
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-neutral-subtle text-neutral ring-neutral-muted',
    dot: 'bg-neutral',
  },
  FAILED: {
    label: 'Failed',
    color: 'bg-danger-subtle text-danger ring-danger-muted',
    dot: 'bg-danger',
  },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: 'bg-neutral-subtle text-neutral ring-neutral-muted',
    dot: 'bg-neutral',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-3 ${
        accent ? 'bg-foreground border-transparent' : 'bg-card border-border'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          accent ? 'bg-white/10' : 'bg-muted/40'
        }`}
      >
        <Icon
          className={`w-4 h-4 ${accent ? 'text-white' : 'text-muted-foreground'}`}
        />
      </div>
      <div>
        <p
          className={`text-2xl font-bold tracking-tight ${accent ? 'text-white' : 'text-foreground'}`}
        >
          {value}
        </p>
        <p
          className={`text-xs mt-0.5 ${accent ? 'text-white/60' : 'text-muted-foreground'}`}
        >
          {label}
          {sub ? ` · ${sub}` : ''}
        </p>
      </div>
    </div>
  )
}

function OrderRow({ order }: { order: OrderDto }) {
  return (
    <Link
      to="/dashboard/orders/$id"
      params={{ id: order.id }}
      className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
    >
      <div className="shrink-0 w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <Package className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {fmtDate(order.createdAt)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-foreground">
          {fmtCurrency(order.total)}
        </p>
        {order.items && (
          <p className="text-xs text-muted-foreground">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
    </Link>
  )
}

function AvatarInitials({
  firstName,
  lastName,
}: {
  firstName: string
  lastName: string
}) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  return (
    <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center shrink-0">
      <span className="text-lg font-bold text-background tracking-tight">
        {initials}
      </span>
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-raised ${className}`}
    />
  )
}

function CustomerDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-3 flex items-center gap-3">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-3 w-2" />
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="h-8 w-20 rounded-lg ml-auto" />
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Profile */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="w-14 h-14 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-5 w-40" />
              <div className="flex gap-4">
                <SkeletonBlock className="h-3.5 w-36" />
                <SkeletonBlock className="h-3.5 w-24" />
              </div>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        {/* Orders */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0"
            >
              <SkeletonBlock className="w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-3.5 w-32" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
              <SkeletonBlock className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })
  const { limit = 10, offset = 0 } = Route.useSearch()
  const { data: customer, isLoading: customerLoading } = useGetCustomerById(id)
  const { data: orders, isLoading: ordersLoading } = useGetCustomerOrdersById(
    id,
    { limit, offset },
  )
  const meta = orders?.meta
  const isLoading = customerLoading && ordersLoading

  const currentPage = meta ? Math.floor(offset / limit) + 1 : 1
  const totalPages = meta ? Math.ceil(meta.total / limit) : 1
  const handleNextPage = () => {
    if (meta?.hasNextPage)
      navigate({ search: { limit, offset: offset + limit } })
  }
  const handlePrevPage = () => {
    if (meta?.hasPreviousPage)
      navigate({ search: { limit, offset: Math.max(0, offset - limit) } })
  }
  const handleLimitChange = (newLimit: number) => {
    navigate({ search: { limit: newLimit, offset: 0 } })
  }
  if (isLoading) return <CustomerDetailSkeleton />

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Customer not found</p>
          <Link
            to="/dashboard/customers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to customers
          </Link>
        </div>
      </div>
    )
  }

  const ordersArray: OrderDto[] = Array.isArray(orders?.orders)
    ? orders.orders
    : []

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center gap-2">
        <Link
          to="/dashboard/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Customers
        </Link>
        <span className="text-border select-none">/</span>
        <span className="text-sm font-medium text-foreground truncate max-w-50">
          {customer.firstName} {customer.lastName}
        </span>
        <Link
          to="/dashboard/customers/$id/edit"
          params={{ id }}
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        {/* Profile card */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <AvatarInitials
              firstName={customer.firstName}
              lastName={customer.lastName}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-foreground">
                {customer.firstName} {customer.lastName}
              </h1>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  {customer.email}
                </span>
                {customer.phone && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    {customer.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {fmtDate(customer.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={DollarSign}
            label="Total Spent"
            value={fmtCurrency(customer.totalSpent)}
            // accent
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={String(customer.ordersCount ?? customer._count?.orders ?? 0)}
          />
          <StatCard
            icon={Clock}
            label="Last Order"
            value={fmtDate(customer.lastOrderAt)}
          />
          <StatCard
            icon={TrendingUp}
            label="Member Since"
            value={fmtDate(customer.createdAt)}
          />
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Order History
            </h2>
            <div className="flex items-center gap-3">
              {meta && (
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {meta.total} order{meta.total !== 1 ? 's' : ''}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Show</span>
                <Select
                  value={limit.toString()}
                  onValueChange={(v) => handleLimitChange(Number(v))}
                >
                  <SelectTrigger className="w-16 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((n) => (
                      <SelectItem
                        key={n}
                        value={n.toString()}
                        className="text-xs"
                      >
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {ordersLoading ? (
            <div>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0"
                >
                  <SkeletonBlock className="w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-32" />
                    <SkeletonBlock className="h-3 w-20" />
                  </div>
                  <SkeletonBlock className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : ordersArray.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No orders yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This customer hasn't placed any orders.
              </p>
            </div>
          ) : (
            <div>
              {ordersArray.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && totalPages > 1 && (
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page{' '}
                <span className="font-medium text-foreground">
                  {currentPage}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                  {totalPages}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={!meta.hasPreviousPage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!meta.hasNextPage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
