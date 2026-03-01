import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/s/$subdomain/cart')({
  component: CartPage,
})

function CartPage() {
  const { subdomain } = Route.useParams()
  const navigate = useNavigate()
  const {
    items,
    subtotal,
    totalItems,
    updateItemQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild>
            <Link to="/s/$subdomain/products" params={{ subdomain }}>
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={clearCart}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.product.id}-${item.variant?.id || 'default'}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center shrink-0">
                    {item.product.featuredImage ? (
                      <img
                        src={item.product.featuredImage.url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No image
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to="/s/$subdomain/products/$productId"
                          params={{
                            subdomain,
                            productId: item.product.id,
                          }}
                          className="font-medium hover:underline"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">
                            {item.variant.name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          removeFromCart(item.product.id, item.variant?.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateItemQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.variant?.id,
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value)
                            if (!isNaN(val) && val > 0) {
                              updateItemQuantity(
                                item.product.id,
                                val,
                                item.variant?.id,
                              )
                            }
                          }}
                          className="w-16 h-8 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateItemQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.variant?.id,
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Items ({totalItems})
                  </span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">
                    Calculated at checkout
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() =>
                    navigate({
                      to: '/s/$subdomain/checkout',
                      params: { subdomain },
                    })
                  }
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/s/$subdomain/products" params={{ subdomain }}>
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
