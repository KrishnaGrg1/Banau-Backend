// Order Detail Page
import { createFileRoute, Link } from '@tanstack/react-router'
import { useOrder, useAddTracking, useRefundOrder } from '@/hooks/use-order'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OrderStatus } from '@repo/shared'
import { format } from 'date-fns'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowLeft, Package, Truck, CreditCard, MapPin } from 'lucide-react'

const statusColors: Record<
  OrderStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'secondary',
  PAID: 'default',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
  FAILED: 'destructive',
}

export const Route = createFileRoute('/dashboard/orders/$id/')({
  component: OrderDetailPage,
})

export default function OrderDetailPage() {
  const { id } = Route.useParams()
  const { data: order, isLoading, error } = useOrder(id)
  const addTracking = useAddTracking()
  const refundOrder = useRefundOrder()

  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingCarrier, setTrackingCarrier] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [showTrackingDialog, setShowTrackingDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)

  const formatPrice = (price: string | null) => {
    if (!price) return '$0.00'
    return `$${parseFloat(price).toFixed(2)}`
  }

  const handleAddTracking = async () => {
    if (!trackingNumber || !trackingCarrier) return

    await addTracking.mutateAsync({
      orderId: id,
      tracking: { trackingNumber, trackingCarrier },
    })
    setShowTrackingDialog(false)
    setTrackingNumber('')
    setTrackingCarrier('')
  }

  const handleRefund = async () => {
    await refundOrder.mutateAsync({
      orderId: id,
      refund: {
        amount: refundAmount ? parseFloat(refundAmount) : undefined,
        reason: refundReason || undefined,
      },
    })
    setShowRefundDialog(false)
    setRefundReason('')
    setRefundAmount('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {error?.message || 'Order not found'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground mt-1">
              Placed on {format(new Date(order.createdAt), 'PPP')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={statusColors[order.status]} className="text-sm">
            {order.status}
          </Badge>

          {/* Tracking Dialog */}
          <Dialog
            open={showTrackingDialog}
            onOpenChange={setShowTrackingDialog}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Truck className="mr-2 h-4 w-4" />
                Add Tracking
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tracking Information</DialogTitle>
                <DialogDescription>
                  Add tracking details to mark this order as shipped.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <Input
                    id="trackingNumber"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trackingCarrier">Carrier</Label>
                  <Input
                    id="trackingCarrier"
                    value={trackingCarrier}
                    onChange={(e) => setTrackingCarrier(e.target.value)}
                    placeholder="e.g., FedEx, UPS, DHL"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddTracking}
                  disabled={!trackingNumber || !trackingCarrier}
                >
                  Save Tracking
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Refund Dialog */}
          <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <CreditCard className="mr-2 h-4 w-4" />
                Refund
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Refund Order</DialogTitle>
                <DialogDescription>
                  Process a refund for this order. Leave amount empty for full
                  refund.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="refundAmount">Refund Amount (Optional)</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`Full refund: ${formatPrice(order.total)}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refundReason">Reason (Optional)</Label>
                  <Input
                    id="refundReason"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Reason for refund"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleRefund}
                  disabled={refundOrder.isPending}
                >
                  Process Refund
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(order.items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-sm text-muted-foreground">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.price)}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.shipping && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatPrice(order.shipping)}</span>
                  </div>
                )}
                {order.tax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}
                {order.discount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  {order.ShippingfirstName} {order.ShippinglastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.ShippingEmail}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.ShippingContactNumber}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p>{order.ShippingAddress}</p>
                {order.ShippingDistrict && <p>{order.ShippingDistrict}</p>}
                <p>
                  {order.ShippingCity}, {order.ShippingState}
                </p>
                <p>{order.ShippingCountry}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carrier</span>
                    <span>{order.trackingCarrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking #</span>
                    <span className="font-mono">{order.trackingNumber}</span>
                  </div>
                  {order.trackingUrl && (
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Track Package
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span>{order.paymentMethod || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={order.paidAt ? 'default' : 'secondary'}>
                    {order.paidAt ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid on</span>
                    <span>{format(new Date(order.paidAt), 'PPP')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(order.notes || order.customerNotes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.customerNotes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Customer Notes
                      </p>
                      <p className="text-sm">{order.customerNotes}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Internal Notes
                      </p>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium">Order Created</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), 'PPP p')}
                    </p>
                  </div>
                </div>
                {order.paidAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Payment Received</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.paidAt), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}
                {order.shippedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Order Shipped</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.shippedAt), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Delivered</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.deliveredAt), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
