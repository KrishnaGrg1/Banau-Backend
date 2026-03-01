// apps/web/app/routes/s/$subdomain/checkout/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import { useCreateCheckoutSession } from '@/hooks/use-order'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Lock, CreditCard } from 'lucide-react'

export const Route = createFileRoute('/s/$subdomain/checkout/')({
  component: CheckoutPage,
})

interface CheckoutFormData {
  email: string
  firstName: string
  lastName: string
  phone: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingDistrict: string
  shippingCountry: string
  customerNotes: string
}

const initialFormData: CheckoutFormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  shippingAddress: '',
  shippingCity: '',
  shippingState: '',
  shippingDistrict: '',
  shippingCountry: '',
  customerNotes: '',
}

function CheckoutPage() {
  const { subdomain } = Route.useParams()
  const navigate = useNavigate()

  const { items, subtotal } = useCart()
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData)
  const [isProcessing, setIsProcessing] = useState(false)

  const createCheckoutSession = useCreateCheckoutSession()

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate({ to: '/s/$subdomain', params: { subdomain } })
    }
  }, [items.length, navigate, subdomain])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    const required = [
      'email',
      'firstName',
      'lastName',
      'phone',
      'shippingAddress',
      'shippingCity',
      'shippingState',
      'shippingCountry',
    ]

    for (const field of required) {
      if (!formData[field as keyof CheckoutFormData]) {
        toast.error(
          `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
        )
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // Create Stripe Checkout session
      const result = await createCheckoutSession.mutateAsync({
        subdomain,
        ...formData,
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity,
          price: item.price,
          productName: item.product.name,
          variantName: item.variant?.name,
        })),
      })

      if (result?.data?.url) {
        // Redirect to Stripe Checkout (hosted page)
        window.location.href = result.data.url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(
        error.message || 'Failed to start checkout. Please try again.',
      )
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  We'll use this email to send you order updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shippingAddress">Address *</Label>
                  <Input
                    id="shippingAddress"
                    name="shippingAddress"
                    placeholder="123 Main St"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="shippingCity">City *</Label>
                    <Input
                      id="shippingCity"
                      name="shippingCity"
                      placeholder="New York"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="shippingState">State/Province *</Label>
                    <Input
                      id="shippingState"
                      name="shippingState"
                      placeholder="NY"
                      value={formData.shippingState}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="shippingDistrict">
                      District (Optional)
                    </Label>
                    <Input
                      id="shippingDistrict"
                      name="shippingDistrict"
                      placeholder="District"
                      value={formData.shippingDistrict}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="shippingCountry">Country *</Label>
                    <Input
                      id="shippingCountry"
                      name="shippingCountry"
                      placeholder="United States"
                      value={formData.shippingCountry}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="customerNotes">Order Notes (Optional)</Label>
                  <Input
                    id="customerNotes"
                    name="customerNotes"
                    placeholder="Special instructions for your order"
                    value={formData.customerNotes}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Secure Payment
                </CardTitle>
                <CardDescription>
                  You'll be redirected to Stripe's secure checkout page to
                  complete your payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">
                        Secure Checkout Powered by Stripe
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <div className="px-3 py-1 bg-background rounded text-xs font-medium">
                      Visa
                    </div>
                    <div className="px-3 py-1 bg-background rounded text-xs font-medium">
                      Mastercard
                    </div>
                    <div className="px-3 py-1 bg-background rounded text-xs font-medium">
                      Amex
                    </div>
                    <div className="px-3 py-1 bg-background rounded text-xs font-medium">
                      Apple Pay
                    </div>
                    <div className="px-3 py-1 bg-background rounded text-xs font-medium">
                      Google Pay
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Secure Checkout...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Proceed to Payment - ${subtotal.toFixed(2)}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By placing this order, you agree to our terms and conditions
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variant?.id || 'default'}`}
                    className="flex justify-between items-start"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                        {item.product.featuredImage ? (
                          <img
                            src={item.product.featuredImage.url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            No image
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
