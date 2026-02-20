import { createProduct, getAllProducts } from '@/lib/services/product-services'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { offset } from 'node_modules/@base-ui/react/esm/floating-ui-react'
import { toast } from 'sonner'

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('Create Product successfully ')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useGetAllProducts(params:{limit:number,offset:number}) {
  return useQuery({
    queryKey: ['products',params],
    queryFn:()=> getAllProducts({data:params}),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
