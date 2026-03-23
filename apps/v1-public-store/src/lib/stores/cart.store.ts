import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ProductDto, ProductVariantDto } from '@repo/shared'

// ==================== Types ====================

export interface CartItem {
  product: ProductDto
  variant?: ProductVariantDto
  quantity: number
  price: number // The actual price to use (variant price or product price)
}

interface CartState {
  items: CartItem[]
  subdomain: string | null
  customerId: string | null
  isHydrated: boolean
}

interface CartActions {
  // Actions
  addItem: (
    product: ProductDto,
    variant?: ProductVariantDto,
    quantity?: number,
  ) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => void
  clearCart: () => void
  getItem: (productId: string, variantId?: string) => CartItem | undefined

  // Setters for sync
  setSubdomain: (subdomain: string) => void
  setCustomerId: (customerId: string | null) => void
  setHydrated: (state: boolean) => void

  // Computed (as functions)
  getSubtotal: () => number
  getTotalItems: () => number
  getCartCount: () => number
}

// ==================== Helpers ====================

const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

const getTotalItems = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

// ==================== Store ====================

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      subdomain: null,
      customerId: null,
      isHydrated: false,

      // Actions
      addItem: (product, variant, quantity = 1) => {
        const state = get()
        const existingIndex = state.items.findIndex(
          (item) =>
            item.product.id === product.id && item.variant?.id === variant?.id,
        )

        const price = variant?.price
          ? parseFloat(variant.price)
          : parseFloat(product.price)

        let newItems: CartItem[]

        if (existingIndex > -1) {
          // Update existing item quantity
          newItems = state.items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        } else {
          // Add new item
          newItems = [...state.items, { product, variant, quantity, price }]
        }

        set({ items: newItems })
      },

      removeItem: (productId, variantId) => {
        const state = get()
        const newItems = state.items.filter(
          (item) =>
            !(item.product.id === productId && item.variant?.id === variantId),
        )
        set({ items: newItems })
      },

      updateQuantity: (productId, quantity, variantId) => {
        const state = get()
        if (quantity <= 0) {
          const newItems = state.items.filter(
            (item) =>
              !(
                item.product.id === productId && item.variant?.id === variantId
              ),
          )
          set({ items: newItems })
          return
        }

        const newItems = state.items.map((item) =>
          item.product.id === productId && item.variant?.id === variantId
            ? { ...item, quantity }
            : item,
        )
        set({ items: newItems })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getItem: (productId, variantId) => {
        return get().items.find(
          (item) =>
            item.product.id === productId && item.variant?.id === variantId,
        )
      },

      // Setters
      setSubdomain: (subdomain) => {
        const currentSubdomain = get().subdomain
        // Clear cart when subdomain changes (different store)
        if (currentSubdomain && currentSubdomain !== subdomain) {
          set({ subdomain, items: [], customerId: null })
        } else {
          set({ subdomain })
        }
      },

      setCustomerId: (customerId) => {
        const currentCustomerId = get().customerId
        // Clear cart when customer changes (logout or different customer)
        if (currentCustomerId && currentCustomerId !== customerId) {
          set({ customerId, items: [] })
        } else {
          set({ customerId })
        }
      },

      setHydrated: (isHydrated) => {
        set({ isHydrated })
      },

      // Computed
      getSubtotal: () => {
        return calculateSubtotal(get().items)
      },

      getTotalItems: () => {
        return getTotalItems(get().items)
      },

      getCartCount: () => {
        return getTotalItems(get().items)
      },
    }),
    {
      name: 'banau-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        subdomain: state.subdomain,
        customerId: state.customerId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)

// ==================== Selector Hooks ====================

// Hook for cart items
export const useCartItems = () => useCartStore((state) => state.items)

// Hook for cart count (for header badge)
export const useCartCount = () => {
  const items = useCartStore((state) => state.items)
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

// Hook for subtotal
export const useCartSubtotal = () => {
  const items = useCartStore((state) => state.items)
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// Hook for hydration status
export const useCartHydrated = () => useCartStore((state) => state.isHydrated)
