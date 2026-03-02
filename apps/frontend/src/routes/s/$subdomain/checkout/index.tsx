// apps/web/app/routes/s/$subdomain/checkout/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
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

function CheckoutPage() {
  const { subdomain } = Route.useParams()
  const navigate = useNavigate()

  const { items, subtotal } = useCart()
  const createCheckoutSession = useCreateCheckoutSession()

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate({ to: '/s/$subdomain', params: { subdomain } })
    }
  }, [items.length, navigate, subdomain])

  const form = useForm({
    defaultValues: {
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
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await createCheckoutSession.mutateAsync({
          subdomain,
          ...value,
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
          window.location.href = result.data.url
        } else {
          throw new Error('Failed to create checkout session')
        }
      } catch (error: any) {
        console.error('Checkout error:', error)
        toast.error(
          error.message || 'Failed to start checkout. Please try again.',
        )
      }
    },
  })

  if (items.length === 0) {
    return null
  }

  const isSubmitting = form.state.isSubmitting

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  We'll use this email to send you order updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? 'Email is required'
                        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                          ? 'Invalid email format'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Email *</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="john@example.com"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="phone"
                  validators={{
                    onChange: ({ value }) =>
                      !value ? 'Phone is required' : undefined,
                  }}
                >
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Phone *</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="firstName"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'First name is required'
                          : value.length < 2
                            ? 'At least 2 characters'
                            : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>First Name *</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="John"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="lastName"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'Last name is required'
                          : value.length < 2
                            ? 'At least 2 characters'
                            : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>Last Name *</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="Doe"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>
                </div>

                <form.Field
                  name="shippingAddress"
                  validators={{
                    onChange: ({ value }) =>
                      !value ? 'Shipping address is required' : undefined,
                  }}
                >
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Address *</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="123 Main St"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>

                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="shippingCity"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? 'City is required' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>City *</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="New York"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="shippingState"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? 'State / Province is required' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>State/Province *</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="NY"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <form.Field name="shippingDistrict">
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>District (Optional)</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="District"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="shippingCountry"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? 'Country is required' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>Country *</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="United States"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>
                </div>

                <form.Field name="customerNotes">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Order Notes (Optional)</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="Special instructions for your order"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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

// ── FieldError ────────────────────────────────────────────────────────────────

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors?.length) return null
  const msg =
    typeof errors[0] === 'string' ? errors[0] : (errors[0] as any)?.message
  if (!msg) return null
  return <p className="text-xs text-destructive">{msg}</p>
}
