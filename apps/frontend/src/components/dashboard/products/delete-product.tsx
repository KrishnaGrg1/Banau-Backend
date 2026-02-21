// components/dashboard/products/product-actions-menu.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Eye, Edit, TrashIcon, MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteProduct } from '@/hooks/use-product'
import { useForm } from '@tanstack/react-form'
import { DeleteProductSchema } from '@repo/shared'

export function ProductActionsMenu({ id, name }: { id: string; name: string }) {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { mutateAsync, isPending } = useDeleteProduct()

  const form = useForm({
    defaultValues: { productId: id },
    validators: { onSubmit: DeleteProductSchema },
    onSubmit: async ({ value }) => {
      await mutateAsync({ data: value })
      setDialogOpen(false)
    },
  })
  useEffect(() => {
    if (dialogOpen) {
      form.reset({ productId: id })
    }
  }, [dialogOpen, id])

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              navigate({ to: '/dashboard/products/$id', params: { id } })
            }
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              navigate({ to: '/dashboard/products/$id/edit', params: { id } })
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onSelect={(e) => {
              e.preventDefault()
              setDropdownOpen(false) // ✅ close dropdown
              setDialogOpen(true) // ✅ open dialog
            }}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold">
              Confirm Deletion{name}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex items-center justify-end">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="flex items-center gap-3"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-10 gap-2 bg-red-600 text-white hover:bg-red-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4" />
                    Delete Product
                  </>
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
