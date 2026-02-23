import {
  addVariant,
  createProduct,
  deleteProduct,
  deleteVariant,
  exportProducts,
  getAllProducts,
  getLowStockProducts,
  getProductById,
  updateProduct,
  updateStock,
  updateVariant,
} from '@/lib/services/product-services'
import { bulkImportProducts } from '@/lib/services/product-services.client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      return await createProduct({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Create Product successfully ')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[CREATE] Error:', err)
    },
  })
}

export function useGetAllProducts(params: { limit: number; offset: number }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getAllProducts({ data: params }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useExportAllProducts() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'xlsx') => {
      const result = await exportProducts({ data: { format } })
      if (!result?.base64) throw new Error('No data returned')
      const byteCharacters = atob(result.base64)
      const byteArray = new Uint8Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i)
      }

      const blob = new Blob([byteArray], { type: result.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Successfully exported products details in ${format}`)
    },
  })
}

export function useBulkImportProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    //use client
    mutationFn: bulkImportProducts,

    //use of server
    // mutationFn: async ({ data }: { data: any }) => {
    //   return await bulkImportProducts({ data })
    // },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Imported Product successfully ')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[CREATE] Error:', err)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data }: { data: { productId: string } }) =>
      deleteProduct({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Delete Product successfully ')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[DELETE] Error:', err)
    },
  })
}

export function useGetProductById(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById({ data: { productId } }),
    enabled: !!productId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ data }: { data: { id: string; product: any } }) => {
      console.log('hooks update', data)
      return await updateProduct({ data })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({
        queryKey: ['product', variables.data.id],
      })
      toast.success('Product updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[UPDATE] Error:', err)
    },
  })
}

// ==================== Low Stock Products ====================
export function useGetLowStockProducts(threshold: number = 10) {
  return useQuery({
    queryKey: ['products', 'low-stock', threshold],
    queryFn: () => getLowStockProducts({ data: { threshold } }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== Product Variants ====================
export function useAddVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      productId,
      variant,
    }: {
      productId: string
      variant: any
    }) => {
      return await addVariant({ data: { productId, variant } })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({
        queryKey: ['product', variables.productId],
      })
      toast.success('Variant added successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[ADD_VARIANT] Error:', err)
    },
  })
}

export function useUpdateVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
      variant,
    }: {
      productId: string
      variantId: string
      variant: any
    }) => {
      return await updateVariant({
        data: { productId, variantId, variant },
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({
        queryKey: ['product', variables.productId],
      })
      toast.success('Variant updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[UPDATE_VARIANT] Error:', err)
    },
  })
}

export function useDeleteVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
    }: {
      productId: string
      variantId: string
    }) => {
      return await deleteVariant({ data: { productId, variantId } })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({
        queryKey: ['product', variables.productId],
      })
      toast.success('Variant deleted successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[DELETE_VARIANT] Error:', err)
    },
  })
}

// ==================== Stock Management ====================
export function useUpdateStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      productId,
      stock,
    }: {
      productId: string
      stock: {
        quantity: number
        action: 'set' | 'add' | 'subtract'
        variantId?: string
        reason?: string
      }
    }) => {
      return await updateStock({ data: { productId, stock } })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({
        queryKey: ['product', variables.productId],
      })
      toast.success('Stock updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[UPDATE_STOCK] Error:', err)
    },
  })
}
