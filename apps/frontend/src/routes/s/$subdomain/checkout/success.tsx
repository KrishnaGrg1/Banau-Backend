import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/s/$subdomain/checkout/success')({
  component: CheckoutSuccessPage,
})

function CheckoutSuccessPage() {
  const { subdomain } = Route.useParams()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your order has been placed
              successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You will receive an email confirmation shortly with your order
              details and tracking information.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link to="/s/$subdomain/account/orders" params={{ subdomain }}>
                  View Your Orders
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/s/$subdomain" params={{ subdomain }}>
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
