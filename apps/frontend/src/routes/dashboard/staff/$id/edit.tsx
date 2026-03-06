import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  useStaffById,
  useUpdateStaffPermission,
} from '@/hooks/use-staff-management'
import { UpdateTenantStaffPermissionSchema } from '@repo/shared'
export const Route = createFileRoute('/dashboard/staff/$id/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { mutateAsync, isPending, error } = useUpdateStaffPermission()
  const { data, isLoading } = useStaffById(id)
  const form = useForm({
    defaultValues: {
      canManageProducts: data?.canManageProducts,
      canManageOrders: data?.canManageOrders,
      canManageCustomers: data?.canManageCustomers,
      canViewAnalytics: data?.canViewAnalytics,
      canManageStaff: data?.canManageStaff,
      staffId: id,
    },
    validators: {
      onSubmit: UpdateTenantStaffPermissionSchema,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({ data: value })
    },
  })

  return (
    <Card className=" space-y-6">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Update Staff Member
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Update team member permissions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          {/* Permissions */}
          {isLoading ? (
            <div className="space-y-4 rounded-xl border p-4">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border p-4">
              <div>
                <h3 className="text-sm font-semibold">Permissions</h3>
                <p className="text-xs text-muted-foreground">
                  Control what this staff member can access.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'canManageProducts', label: 'Manage Products' },
                  { name: 'canManageOrders', label: 'Manage Orders' },
                  { name: 'canManageCustomers', label: 'Manage Customers' },
                  { name: 'canViewAnalytics', label: 'View Analytics' },
                  { name: 'canManageStaff', label: 'Manage Staff' },
                ].map((permission) => (
                  <form.Field
                    key={permission.name}
                    name={permission.name as any}
                  >
                    {(field) => (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={!!field.state.value}
                          onCheckedChange={(v) => field.handleChange(!!v)}
                        />
                        <span className="text-sm">{permission.label}</span>
                      </label>
                    )}
                  </form.Field>
                ))}
              </div>
            </div>
          )}

          {/* Server error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error.message}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Staff Member...
              </>
            ) : (
              'Update Staff Member'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
