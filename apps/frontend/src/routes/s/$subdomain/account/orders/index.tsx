import { createFileRoute, Link } from '@tanstack/react-router'
import { useMyOrders } from '@/hooks/use-order'
import type { OrderDto, OrderItemDto } from '@repo/shared'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { format } from 'date-fns'

export const Route = createFileRoute('/s/$subdomain/account/orders/')({
  component: CustomerOrdersPage,
})

function CustomerOrdersPage() {
  const { subdomain } = Route.useParams()
  const { data: response, isLoading, error } = useMyOrders()

  const orders = response?.data?.orders ?? []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner className="w-8 h-8" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load orders</p>
          <p className="text-muted-foreground mt-2">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You have no orders yet.
            </p>
            <Button asChild>
              <Link to="/s/$subdomain" params={{ subdomain }}>
                Start Shopping
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: OrderDto) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <CardDescription>
                      Placed on {format(new Date(order.createdAt), 'PPP')}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      order.status === 'DELIVERED'
                        ? 'default'
                        : order.status === 'CANCELLED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items Preview */}
                  <div className="flex flex-wrap gap-2">
                    {(order.items ?? [])
                      .slice(0, 3)
                      .map((item: OrderItemDto) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 bg-muted rounded-md p-2"
                        >
                          <div className="text-sm">
                            <p className="font-medium truncate max-w-[150px]">
                              {item.productName}
                            </p>
                            <p className="text-muted-foreground">
                              {item.quantity} x ${item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    {(order.items?.length ?? 0) > 3 && (
                      <div className="flex items-center text-muted-foreground text-sm">
                        +{(order.items?.length ?? 0) - 3} more items
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-bold">${order.total}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to="/s/$subdomain/account/orders/$orderId"
                        params={{ subdomain, orderId: order.id }}
                      >
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
