import { useGetCustomerById, useUpdateCustomer } from '@/hooks/use-customer'
import { UpdateCustomerSchema } from '@repo/shared'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/ui/field'

export const Route = createFileRoute('/dashboard/customers/$id/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { mutateAsync, isPending, error } = useUpdateCustomer()
  const { data, isLoading } = useGetCustomerById(id)

  const form = useForm({
    defaultValues: {
      customerId: id,
      email: data?.email ?? '',
      firstName: data?.firstName ?? '',
      lastName: data?.lastName ?? '',
      phone: data?.phone ?? '',
    },
    validators: {
      onSubmit: UpdateCustomerSchema,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({ data: value })
    },
  })

  return (
    <Card className="space-y-6">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Update Customer</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Update customer details.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            {/* Name row skeleton */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
                </div>
              ))}
            </div>

            {/* Email skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
            </div>

            {/* Phone skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
            </div>

            {/* Submit skeleton */}
            <div className="h-11 w-full rounded-md bg-muted animate-pulse" />
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            {/* Name Grid */}
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="firstName"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? 'Required'
                      : value.length < 2
                        ? 'Min 2 characters'
                        : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>First Name</Label>
                    <Input
                      id={field.name}
                      placeholder="John"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError
                      errors={field.state.meta.errors?.map((err) =>
                        typeof err === 'string' ? { message: err } : err,
                      )}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="lastName"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? 'Required'
                      : value.length < 2
                        ? 'Min 2 characters'
                        : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Last Name</Label>
                    <Input
                      id={field.name}
                      placeholder="Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError
                      errors={field.state.meta.errors?.map((err) =>
                        typeof err === 'string' ? { message: err } : err,
                      )}
                    />
                  </div>
                )}
              </form.Field>
            </div>

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
                    errors={field.state.meta.errors?.map((err) =>
                      typeof err === 'string' ? { message: err } : err,
                    )}
                  />
                </div>
              )}
            </form.Field>

            {/* Phone */}
            <form.Field
              name="phone"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? 'Phone is required'
                    : value.length < 8
                      ? 'Min 8 characters'
                      : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Phone</Label>
                  <Input
                    id={field.name}
                    type="tel"
                    placeholder="980000000"
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError
                    errors={field.state.meta.errors?.map((err) =>
                      typeof err === 'string' ? { message: err } : err,
                    )}
                  />
                </div>
              )}
            </form.Field>

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
                  Updating Customer...
                </>
              ) : (
                'Update Customer'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
