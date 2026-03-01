import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { XCircle } from 'lucide-react'

export const Route = createFileRoute('/s/$subdomain/checkout/failed')({
  component: CheckoutFailedPage,
})

function CheckoutFailedPage() {
  const { subdomain } = Route.useParams()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Order Failed</CardTitle>
            <CardDescription>
              Something went wrong with your order. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your payment was not processed. No charges have been made to your
              account.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link to="/s/$subdomain/checkout" params={{ subdomain }}>
                  Try Again
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
