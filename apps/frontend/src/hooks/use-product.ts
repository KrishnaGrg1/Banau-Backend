import {
  createProduct,
  deleteProduct,
  exportProducts,
  getAllProducts,
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
      console.error('[CREATE] Error:', err)
    },
  })
}

