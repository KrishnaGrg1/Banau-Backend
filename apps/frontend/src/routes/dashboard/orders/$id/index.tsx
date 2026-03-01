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
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Hash,
  ShoppingCart,
  DollarSign,
  FileText,
} from 'lucide-react'

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
      <div className="flex items-center justify-center min-h-100">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-100">
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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <Badge variant={statusColors[order.status]} className="text-sm">
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(order.createdAt), 'PPP')}
              </div>
              {order.paymentIntentId && (
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  Payment: {order.paymentIntentId.slice(-8)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tracking Dialog */}
          <Dialog
            open={showTrackingDialog}
            onOpenChange={setShowTrackingDialog}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
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
              <Button variant="destructive" size="sm">
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
                  {refundOrder.isPending ? 'Processing...' : 'Process Refund'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Order Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(order.total)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{order.items?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CARD'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {order.paidAt
                ? `Paid ${format(new Date(order.paidAt), 'MMM d')}`
                : 'Pending'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Fulfillment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {order.shippedAt
                ? 'Shipped'
                : order.status === 'DELIVERED'
                  ? 'Delivered'
                  : 'Unfulfilled'}
            </div>
            {order.trackingNumber && (
              <div className="text-xs text-muted-foreground mt-1">
                {order.trackingCarrier}
              </div>
            )}
          </CardContent>
        </Card>
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
              <CardDescription>
                {order.items?.length || 0}{' '}
                {order.items?.length === 1 ? 'item' : 'items'} in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(order.items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 py-4 border-b last:border-0"
                  >
                    {/* Product Image/Icon */}
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-sm text-muted-foreground">
                          Variant: {item.variantName}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">SKU:</span>
                          <span className="font-mono">
                            {item.productId.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Qty:</span>
                          <span className="font-semibold">{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Price:</span>
                          <span>{formatPrice(item.price)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-lg">
                        {formatPrice(
                          (parseFloat(item.price) * item.quantity).toString(),
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatPrice(item.price)}
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
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                {order.shipping && parseFloat(order.shipping) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {formatPrice(order.shipping)}
                    </span>
                  </div>
                )}
                {order.tax && parseFloat(order.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      {formatPrice(order.tax)}
                    </span>
                  </div>
                )}
                {order.discount && parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600 font-medium">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                {order.paidAt && (
                  <div className="pt-2 border-t">
                    <Badge variant="default" className="w-full justify-center">
                      Paid on {format(new Date(order.paidAt), 'PPP')}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {order.ShippingfirstName} {order.ShippinglastName}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium break-all">
                      {order.ShippingEmail}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{order.ShippingContactNumber}</p>
                  </div>
                </div>
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
              <div className="space-y-1.5">
                <p className="text-sm">{order.ShippingAddress}</p>
                {order.ShippingDistrict && (
                  <p className="text-sm">{order.ShippingDistrict}</p>
                )}
                <p className="text-sm">
                  {order.ShippingCity}, {order.ShippingState}
                </p>
                <p className="text-sm font-medium">{order.ShippingCountry}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipment Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Carrier
                    </p>
                    <p className="font-semibold">{order.trackingCarrier}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Tracking Number
                    </p>
                    <p className="font-mono text-sm font-medium">
                      {order.trackingNumber}
                    </p>
                  </div>
                  {order.trackingUrl && (
                    <>
                      <Separator />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Track Shipment
                        </a>
                      </Button>
                    </>
                  )}
                  {order.shippedAt && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Shipped on {format(new Date(order.shippedAt), 'PPP')}
                        </span>
                      </div>
                    </>
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
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Payment Method
                  </p>
                  <p className="font-semibold">
                    {order.paymentMethod
                      ? order.paymentMethod.charAt(0).toUpperCase() +
                        order.paymentMethod.slice(1)
                      : 'Card'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={order.paidAt ? 'default' : 'secondary'}>
                    {order.paidAt ? 'Paid' : 'Pending Payment'}
                  </Badge>
                </div>
                {order.paidAt && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Paid on {format(new Date(order.paidAt), 'PPP p')}
                      </span>
                    </div>
                  </>
                )}
                {order.paymentIntentId && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Payment ID
                      </p>
                      <p className="font-mono text-xs">
                        {order.paymentIntentId}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {((order.notes && order.notes.trim()) ||
            (order.customerNotes && order.customerNotes.trim())) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.customerNotes && order.customerNotes.trim() && (
                    <div>
                      <p className="text-sm font-semibold mb-2">
                        Customer Notes
                      </p>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{order.customerNotes}</p>
                      </div>
                    </div>
                  )}
                  {order.notes && order.notes.trim() && (
                    <div>
                      <p className="text-sm font-semibold mb-2">
                        Internal Notes
                      </p>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order Placed</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), 'PPP p')}
                    </p>
                  </div>
                </div>

                {order.paidAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment Confirmed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.paidAt), 'PPP p')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount: {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                )}

                {order.shippedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order Shipped</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.shippedAt), 'PPP p')}
                      </p>
                      {order.trackingCarrier && (
                        <p className="text-xs text-muted-foreground mt-1">
                          via {order.trackingCarrier}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {order.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Delivered</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.deliveredAt), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}

                {!order.shippedAt && !order.deliveredAt && order.paidAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-300 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Awaiting Shipment
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
