import {
  acceptInvite,
  createStaffMember,
  deleteStaffById,
  exportStaffMembers,
  inviteStaffMember,
  listAllStaff,
  staffById,
  updateStaffPermission,
} from '@/lib/services/staff-management.services'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export function useListAllStaff(params: { limit: number; offset: number }) {
  return useQuery({
    queryKey: ['staffs', params],
    queryFn: () => listAllStaff({ data: params }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStaffById(staffId: string) {
  return useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => staffById({ data: { staffId } }),
    enabled: !!staffId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDeleteStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data }: { data: { staffId: string } }) =>
      deleteStaffById({ data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
      queryClient.removeQueries({
        queryKey: ['staff', variables.data.staffId],
      })
      toast.success('Staff deleted successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[DELETE] Error:', err)
    },
  })
}

export function useExportAllStaffs() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'xlsx') => {
      const result = await exportStaffMembers({ data: { format } })
      if (!result?.base64) throw new Error('No data returned')

      const byteCharacters = atob(result.base64)
      const byteArray = new Uint8Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i)
      }

      const blob = new Blob([byteArray], { type: result.mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      link.click()
      URL.revokeObjectURL(url)

      toast.success(`Successfully exported staffs in ${format}`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useCreateStaffMember() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: createStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
      toast.success('Staff member created successfully')
      navigate({ to: '/dashboard/staff' })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useUpdateStaffPermission() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: updateStaffPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
      toast.success('Staff permissions updated successfully')
      navigate({ to: '/dashboard/staff' })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useInviteStaff() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: inviteStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
      toast.success('Staff member invited successfully')
      navigate({ to: '/dashboard/staff' })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useAcceptInvite() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: acceptInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
      toast.success('Invite accepted successfully')
      navigate({ to: '/login' })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
