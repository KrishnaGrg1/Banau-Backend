import { useCartStore, type CartItem } from '@/lib/stores/cart.store'
import type { ProductDto, ProductVariantDto } from '@repo/shared'
import { useMemo } from 'react'

/**
 * Hook to interact with the cart
 * Provides convenient methods for cart operations
 */
export function useCart() {
  // Subscribe to items array for reactivity
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const setSubdomain = useCartStore((state) => state.setSubdomain)
  const setCustomerId = useCartStore((state) => state.setCustomerId)

  // Memoize computed values based on items
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  /**
   * Add a product to the cart
   */
  const addToCart = (
    product: ProductDto,
    variant?: ProductVariantDto,
    quantity: number = 1,
  ) => {
    addItem(product, variant, quantity)
  }

  /**
   * Remove a product from the cart
   */
  const removeFromCart = (productId: string, variantId?: string) => {
    removeItem(productId, variantId)
  }

  /**
   * Update the quantity of an item in the cart
   */
  const updateItemQuantity = (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => {
    updateQuantity(productId, quantity, variantId)
  }

  /**
   * Check if a product is in the cart
   */
  const isInCart = (productId: string, variantId?: string): boolean => {
    return items.some(
      (item) => item.product.id === productId && item.variant?.id === variantId,
    )
  }

  /**
   * Get the quantity of a product in the cart
   */
  const getItemQuantity = (productId: string, variantId?: string): number => {
    const item = items.find(
      (item) => item.product.id === productId && item.variant?.id === variantId,
    )
    return item?.quantity ?? 0
  }

  /**
   * Get an item from the cart
   */
  const getCartItem = (
    productId: string,
    variantId?: string,
  ): CartItem | undefined => {
    return items.find(
      (item) => item.product.id === productId && item.variant?.id === variantId,
    )
  }

  return {
    items,
    subtotal,
    totalItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getCartItem,
    setSubdomain,
    setCustomerId,
  }
}
