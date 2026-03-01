import { useState } from 'react'
import { Plus, Minus, ShoppingBag, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import type { ProductDto, ProductVariantDto } from '@repo/shared'

interface AddToCartButtonProps {
  product: ProductDto
  variant?: ProductVariantDto
  showQuantity?: boolean
  className?: string
}

export function AddToCartButton({
  product,
  variant,
  showQuantity = true,
  className,
}: AddToCartButtonProps) {
  const { addToCart, isInCart, getItemQuantity, updateItemQuantity } = useCart()
  const [quantity, setQuantity] = useState(1)

  const inCart = isInCart(product.id, variant?.id)
  const cartQuantity = getItemQuantity(product.id, variant?.id)

  const handleAddToCart = () => {
    addToCart(product, variant, quantity)
    setQuantity(1)
  }

  const incrementQuantity = () => {
    if (inCart) {
      updateItemQuantity(product.id, cartQuantity + 1, variant?.id)
    } else {
      setQuantity((q) => q + 1)
    }
  }

  const decrementQuantity = () => {
    if (inCart) {
      if (cartQuantity > 1) {
        updateItemQuantity(product.id, cartQuantity - 1, variant?.id)
      }
    } else {
      setQuantity((q) => Math.max(1, q - 1))
    }
  }

  const displayQuantity = inCart ? cartQuantity : quantity

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {showQuantity && (
        <div className="flex items-center border rounded-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={decrementQuantity}
            disabled={displayQuantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-10 text-center text-sm font-medium">
            {displayQuantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={incrementQuantity}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        className="flex-1"
        disabled={product.status !== 'ACTIVE'}
      >
        {inCart ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Add More ({cartQuantity} in cart)
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  )
}
