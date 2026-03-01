import {
  paginationDtoSchema,
  OrdersListResponse,
  OrderResponse,
  OrderDto,
  PaymentIntentResponse,
  updateOrderStatusSchema,
  addTrackingDtoSchema,
  refundDtoSchema,
  CreatePaymentIntentDtoSchema,
  ConfirmOrderDtoSchema,
  exportOrdersParamsSchema,
  CreateCheckoutSessionDtoSchema,
  CheckoutSessionResponse,
} from '@repo/shared'
import { createServerFn } from '@tanstack/react-start'
import { api } from '../axios'
import { isAxiosError } from 'axios'

// ==================== Admin Order Services ====================

/**
 * Get all orders for the authenticated tenant
 */
export const getAllOrders = createServerFn({ method: 'GET' })
  .inputValidator((data) => paginationDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<OrdersListResponse>('/order', {
        method: 'GET',
        params: data,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getAllOrders] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve orders')
    }
  })

/**
 * Get a specific order by ID
 */
export const getOrderById = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => {
    const orderId = (data as { orderId: string }).orderId
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('Order ID is required')
    }
    return { orderId }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<OrderResponse>(`/order/${data.orderId}`, {
        method: 'GET',
      })
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getOrderById] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve order')
    }
  })

/**
 * Update order status
 */
export const updateOrderStatus = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const { orderId, status } = data as { orderId: string; status: unknown }
    if (!orderId) throw new Error('Order ID is required')
    return { orderId, status: updateOrderStatusSchema.parse(status) }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<OrderResponse>(
        `/order/${data.orderId}/status`,
        {
          method: 'PUT',
          data: data.status,
        },
      )
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[updateOrderStatus] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to update order status')
    }
  })

/**
 * Add tracking information to an order
 */
export const addTracking = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const { orderId, tracking } = data as {
      orderId: string
      tracking: unknown
    }
    if (!orderId) throw new Error('Order ID is required')
    return { orderId, tracking: addTrackingDtoSchema.parse(tracking) }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<OrderResponse>(
        `/order/${data.orderId}/tracking`,
        {
          method: 'PUT',
          data: data.tracking,
        },
      )
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[addTracking] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to add tracking information')
    }
  })

/**
 * Refund an order
 */
export const refundOrder = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const { orderId, refund } = data as { orderId: string; refund: unknown }
    if (!orderId) throw new Error('Order ID is required')
    return { orderId, refund: refundDtoSchema.parse(refund) }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<OrderResponse>(
        `/order/${data.orderId}/refund`,
        {
          method: 'POST',
          data: data.refund,
        },
      )
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[refundOrder] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to refund order')
    }
  })

/**
 * Export orders to CSV or XLSX
 */
export const exportOrders = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => exportOrdersParamsSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const res = await api('/order/export', {
        method: 'GET',
        params: data,
        responseType: 'arraybuffer',
      })

      if (res.status === 200) {
        const buffer = Buffer.from(res.data)
        const format = data.format ?? 'csv'
        const filename = `orders-${Date.now()}.${format}`
        const mimeType =
          format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv'

        return {
          success: true,
          base64: buffer.toString('base64'),
          filename,
          mimeType,
        }
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[exportOrders] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to export orders')
    }
  })

// ==================== Customer Order Services ====================

/**
 * Get orders for the authenticated customer
 */
export const getMyOrders = createServerFn({ method: 'GET' })
  .inputValidator((data) => paginationDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<OrdersListResponse>('/order/my-orders', {
        method: 'GET',
        params: data,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getMyOrders] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve your orders')
    }
  })

/**
 * Get a specific order for the authenticated customer
 */
export const getMyOrder = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => {
    const orderId = (data as { orderId: string }).orderId
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('Order ID is required')
    }
    return { orderId }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<OrderResponse>(
        `/order/my-orders/${data.orderId}`,
        {
          method: 'GET',
        },
      )
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getMyOrder] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve order')
    }
  })

// ==================== Public Order Services (Storefront Checkout) ====================

/**
 * Create a payment intent for checkout
 */
export const createPaymentIntent = createServerFn({ method: 'POST' })
  .inputValidator((data) => CreatePaymentIntentDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<PaymentIntentResponse>(
        '/order/create-payment-intent',
        {
          method: 'POST',
          data,
        },
      )
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[createPaymentIntent] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to create payment intent')
    }
  })

/**
 * Confirm an order after payment
 */
export const confirmOrder = createServerFn({ method: 'POST' })
  .inputValidator((data) => ConfirmOrderDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<OrderResponse>('/order/confirm', {
        method: 'POST',
        data,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[confirmOrder] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to confirm order')
    }
  })

/**
 * Create a Stripe Checkout session (Hosted Checkout)
 */
export const createCheckoutSession = createServerFn({ method: 'POST' })
  .inputValidator((data) => CreateCheckoutSessionDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<{
        success: boolean
        data: CheckoutSessionResponse
        message: string
      }>('/order/create-checkout-session', {
        method: 'POST',
        data,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[createCheckoutSession] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to create checkout session')
    }
  })
