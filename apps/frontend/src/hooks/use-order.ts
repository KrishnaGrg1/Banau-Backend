import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  addTracking,
  refundOrder,
  exportOrders,
  getMyOrders,
  getMyOrder,
  createPaymentIntent,
  confirmOrder,
  createCheckoutSession,
} from '@/lib/services/order.services'
import type {
  paginationDto,
  OrderStatus,
  ConfirmOrderDto,
  CreatePaymentIntentDto,
  ExportOrdersParams,
  CreateCheckoutSessionDto,
} from '@repo/shared'

// ==================== Admin Order Hooks ====================

/**
 * Hook to fetch all orders for the authenticated tenant
 */
export function useOrders(params: paginationDto = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => getAllOrders({ data: params }),
  })
}

/**
 * Hook to fetch a specific order by ID
 */
export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById({ data: { orderId: orderId! } }),
    enabled: !!orderId,
  })
}

/**
 * Hook to update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string
      status: { status: OrderStatus }
    }) => {
      return updateOrderStatus({ data: { orderId, status } })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] })
      toast.success('Order status updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status')
    },
  })
}

/**
 * Hook to add tracking information to an order
 */
export function useAddTracking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      tracking,
    }: {
      orderId: string
      tracking: { trackingNumber: string; trackingCarrier: string }
    }) => {
      return addTracking({ data: { orderId, tracking } })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] })
      toast.success('Tracking information added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add tracking information')
    },
  })
}

/**
 * Hook to refund an order
 */
export function useRefundOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      refund,
    }: {
      orderId: string
      refund?: { amount?: number; reason?: string }
    }) => {
      return refundOrder({ data: { orderId, refund: refund || {} } })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] })
      toast.success('Order refunded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to refund order')
    },
  })
}

/**
 * Hook to export orders
 */
export function useExportOrders() {
  return useMutation({
    mutationFn: async (params: ExportOrdersParams) => {
      const result = await exportOrders({ data: params })
      if (result?.success && result.base64) {
        // Convert base64 to blob and download
        const binaryString = atob(result.base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: result.mimeType })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
      return result
    },
    onSuccess: () => {
      toast.success('Orders exported successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export orders')
    },
  })
}

// ==================== Customer Order Hooks ====================

/**
 * Hook to fetch orders for the authenticated customer
 */
export function useMyOrders(params: paginationDto = {}) {
  return useQuery({
    queryKey: ['my-orders', params],
    queryFn: () => getMyOrders({ data: params }),
    select: (data) => data, // Return full response with data.orders structure
  })
}

/**
 * Hook to fetch a specific order for the authenticated customer
 */
export function useMyOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['my-order', orderId],
    queryFn: () => getMyOrder({ data: { orderId: orderId! } }),
    enabled: !!orderId,
  })
}

// ==================== Checkout Hooks ====================

/**
 * Hook to create a payment intent for checkout
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (data: CreatePaymentIntentDto) => {
      return createPaymentIntent({ data })
    },
    onSuccess: () => {
      toast.success('Payment intent created')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create payment intent')
    },
  })
}

/**
 * Hook to confirm an order after payment
 */
export function useConfirmOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ConfirmOrderDto) => {
      return confirmOrder({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Order confirmed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm order')
    },
  })
}

/**
 * Hook to create a Stripe Checkout session (Hosted Checkout)
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async (data: CreateCheckoutSessionDto) => {
      return createCheckoutSession({ data })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create checkout session')
    },
  })
}
