import { createProduct, getAllProducts } from '@/lib/services/product-services'
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
