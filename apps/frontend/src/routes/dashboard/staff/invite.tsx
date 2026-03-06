import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useInviteStaff } from '@/hooks/use-staff-management'
import { InviteStaffDtoSchema } from '@repo/shared'

export const Route = createFileRoute('/dashboard/staff/invite')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync, isPending, error } = useInviteStaff()
  const form = useForm({
    defaultValues: {
      email: '',
      canManageProducts: false,
      canManageOrders: false,
      canManageCustomers: false,
      canViewAnalytics: false,
      canManageStaff: false,
    },
    validators: {
      onSubmit: InviteStaffDtoSchema,
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
          Create Staff Member
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Add a new team member and assign permissions.
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
          {/* Email */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Email is required'
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    ? 'Invalid email format'
                    : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="john@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError
                  errors={field.state.meta.errors?.map((e) =>
                    typeof e === 'string' ? { message: e } : e,
                  )}
                />
              </div>
            )}
          </form.Field>

          {/* Permissions */}
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
                <form.Field key={permission.name} name={permission.name as any}>
                  {(field) => (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={field.state.value}
                        onCheckedChange={(v) => field.handleChange(!!v)}
                      />
                      <span className="text-sm">{permission.label}</span>
                    </label>
                  )}
                </form.Field>
              ))}
            </div>
          </div>

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
                Creating Staff Member...
              </>
            ) : (
              'Create Staff Member'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
