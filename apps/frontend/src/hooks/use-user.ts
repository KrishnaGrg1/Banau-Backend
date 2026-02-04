import { useQuery } from '@tanstack/react-query'

import { getMe } from '@/lib/services/user.services'

export function useGetMe() {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    user,
    isLoading,
    error,
    refetch,
  }
}
