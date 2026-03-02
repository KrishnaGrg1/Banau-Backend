import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { MapPin } from 'lucide-react'
import type { OrderDto } from '@repo/shared'
import { useCustomerOrders } from '@/hooks/use-customer-auth'

export const Route = createFileRoute('/s/$subdomain/account/addresses/')({
  component: AddressesPage,
})

function AddressesPage() {
  const { subdomain } = Route.useParams()
  const { data: ordersRes, isLoading } = useCustomerOrders({ limit: 50 })

  const orders: OrderDto[] = ordersRes?.data?.orders ?? []

  // Deduplicate shipping addresses from orders
  const uniqueAddresses = Array.from(
    new Map(
      orders
        .filter((o) => o.ShippingAddress)
        .map((o) => [
          `${o.ShippingAddress}|${o.ShippingCity}`,
          {
            address: o.ShippingAddress,
            city: o.ShippingCity,
            state: o.ShippingState,
            country: o.ShippingCountry,
          },
        ]),
    ).values(),
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Saved Addresses</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Shipping addresses from your orders.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      ) : uniqueAddresses.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium mb-1">No addresses found</p>
          <p className="text-sm text-muted-foreground mb-5">
            Addresses used in your orders will appear here.
          </p>
          <Button asChild size="sm">
            <Link to="/s/$subdomain" params={{ subdomain }}>
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {uniqueAddresses.map((addr, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-4 flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5 shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{addr.address}</p>
                <p className="text-sm text-muted-foreground">
                  {[addr.city, addr.state, addr.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
