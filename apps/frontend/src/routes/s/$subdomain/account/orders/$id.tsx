import { createFileRoute, Link } from '@tanstack/react-router'
import { useMyOrder } from '@/hooks/use-order'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import type { OrderItemDto } from '@repo/shared'

export const Route = createFileRoute('/s/$subdomain/account/orders/$id')({
  component: OrderDetailPage,
})

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function OrderDetailPage() {
  const { subdomain, id } = Route.useParams()
  const { data: order, isLoading, error } = useMyOrder(id)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground text-sm mb-4">Order not found.</p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/s/$subdomain/account/orders/" params={{ subdomain }}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Orders
          </Link>
        </Button>
      </div>
    )
  }

  const isCancelled = order.status === 'CANCELLED'
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            asChild
          >
            <Link to="/s/$subdomain/account/orders/" params={{ subdomain }}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold">
              #{order.id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-xs text-muted-foreground">
              Placed on {format(new Date(order.createdAt), 'PPP')}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full border shrink-0 ${
            STATUS_STYLES[order.status] ??
            'bg-muted text-muted-foreground border-border'
          }`}
        >
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Order Progress</h3>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep
              const isLast = i === STATUS_STEPS.length - 1
              return (
                <div
                  key={step}
                  className="flex items-center"
                  style={{ flex: isLast ? '0 0 auto' : 1 }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                        done
                          ? 'bg-primary border-primary'
                          : 'bg-background border-border'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium whitespace-nowrap ${
                        done ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 h-0.5 mb-4 mx-1 transition-colors ${
                        i < currentStep ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center gap-2 p-4 pb-3">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Items</h3>
        </div>
        <Separator />
        <div className="divide-y">
          {(order.items ?? []).map((item: OrderItemDto) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="font-medium text-sm">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">
                    {item.variantName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-sm">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-bold">${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Shipping */}
        {order.ShippingAddress && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Shipping Address</h3>
            </div>
            <p className="text-sm">{order.ShippingAddress}</p>
            {order.ShippingCity && (
              <p className="text-sm text-muted-foreground">
                {[
                  order.ShippingCity,
                  order.ShippingState,
                  order.ShippingCountry,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Payment / Tracking */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Payment</h3>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">
              {(order.status ?? 'Pending')
                .toString()
                .toLowerCase()
                .replace(/_/g, ' ')}
            </span>
          </div>
          {order.trackingNumber && (
            <>
              <Separator />
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Tracking</h3>
              </div>
              <p className="text-sm font-mono">{order.trackingNumber}</p>
              {order.trackingCarrier && (
                <p className="text-xs text-muted-foreground">
                  {order.trackingCarrier}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
