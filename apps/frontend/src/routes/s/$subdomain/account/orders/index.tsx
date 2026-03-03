import { createFileRoute, Link } from '@tanstack/react-router'
import type { OrderDto, OrderItemDto } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { format } from 'date-fns'
import { ShoppingBag, ChevronRight, Package } from 'lucide-react'
import { useCustomerOrders } from '@/hooks/use-customer'

export const Route = createFileRoute('/s/$subdomain/account/orders/')({
  component: CustomerOrdersPage,
})

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

function CustomerOrdersPage() {
  const { subdomain } = Route.useParams()
  const { data: response, isLoading, error } = useCustomerOrders()

  const orders: OrderDto[] = response?.data?.orders ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-destructive font-medium">
          Failed to load orders
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">My Orders</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium mb-1">No orders yet</p>
          <p className="text-sm text-muted-foreground mb-5">
            When you place an order it will appear here.
          </p>
          <Button asChild size="sm">
            <Link to="/s/$subdomain" params={{ subdomain }}>
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y overflow-hidden">
          {orders.map((order: OrderDto) => (
            <Link
              key={order.id}
              to="/s/$subdomain/account/orders/$id"
              params={{ subdomain, id: order.id }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </p>
                  {/* Items preview */}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(order.items ?? [])
                      .slice(0, 2)
                      .map((item: OrderItemDto) => item.productName)
                      .join(', ')}
                    {(order.items?.length ?? 0) > 2 &&
                      ` +${(order.items?.length ?? 0) - 2} more`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:ml-auto shrink-0">
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
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
  )
}
