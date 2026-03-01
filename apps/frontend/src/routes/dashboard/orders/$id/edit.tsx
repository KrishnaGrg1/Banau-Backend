// Order Edit Page
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  useOrder,
  useUpdateOrderStatus,
  useAddTracking,
} from '@/hooks/use-order'
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
import { Textarea } from '@/components/ui/textarea'
import type { OrderStatus } from '@repo/shared'
import { format } from 'date-fns'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

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

const statusOptions: OrderStatus[] = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'FAILED',
]

export const Route = createFileRoute('/dashboard/orders/$id/edit')({
  component: OrderEditPage,
})

export default function OrderEditPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: order, isLoading, error } = useOrder(id)
  const updateOrderStatus = useUpdateOrderStatus()
  const addTracking = useAddTracking()

  const [status, setStatus] = useState<OrderStatus | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingCarrier, setTrackingCarrier] = useState('')
  const [notes, setNotes] = useState('')

  // Initialize form when order loads
  useState(() => {
    if (order) {
      setStatus(order.status)
      setTrackingNumber(order.trackingNumber || '')
      setTrackingCarrier(order.trackingCarrier || '')
      setNotes(order.notes || '')
    }
  })

  const formatPrice = (price: string | null) => {
    if (!price) return '$0.00'
    return `$${parseFloat(price).toFixed(2)}`
  }

  const handleSave = async () => {
    if (!status) {
      toast.error('Please select a status')
      return
    }

    try {
      // Update status
      await updateOrderStatus.mutateAsync({
        orderId: id,
        status: { status },
      })

      // Update tracking if provided
      if (trackingNumber && trackingCarrier) {
        await addTracking.mutateAsync({
          orderId: id,
          tracking: { trackingNumber, trackingCarrier },
        })
      }

      toast.success('Order updated successfully')
      navigate({
        to: '/dashboard/orders/$id',
        params: { id },
      })
    } catch (error) {
      console.error('Failed to update order:', error)
    }
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
            <Link to="/dashboard/orders/$id" params={{ id }}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground mt-1">
              Created on {format(new Date(order.createdAt), 'PPP')}
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={updateOrderStatus.isPending}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>
                Update the current status of this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status || order.status}
                    onValueChange={(value: OrderStatus) => setStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <Badge variant={statusColors[status || order.status]}>
                          {status || order.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Information</CardTitle>
              <CardDescription>
                Add or update shipping tracking details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackingCarrier">Carrier</Label>
                    <Input
                      id="trackingCarrier"
                      value={
                        trackingNumber
                          ? trackingCarrier
                          : order.trackingCarrier || ''
                      }
                      onChange={(e) => setTrackingCarrier(e.target.value)}
                      placeholder="e.g., FedEx, UPS, DHL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input
                      id="trackingNumber"
                      value={trackingNumber || order.trackingNumber || ''}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
              <CardDescription>
                Add notes for internal use (not visible to customer)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes || order.notes || ''}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
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
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items ({order.items?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(order.items ?? []).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
