import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCustomerCreate } from '@/hooks/use-customer'
import { FieldError } from '@/routes/(auth)/login'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  Info,
  Loader2,
  Mail,
  Shield,
  UserPlus,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/customers/new')({
  component: AddNewCustomerPage,
})

export default function AddNewCustomerPage() {
  const navigate = useNavigate()
  const {
    mutateAsync: createCustomer,
    isPending,
    isError,
    error,
  } = useCustomerCreate()

  const form = useForm({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: undefined as string | undefined,
    },
    onSubmit: async ({ value }) => {
      const { phone, ...rest } = value
      await createCustomer({
        data: {
          ...rest,
          ...(phone ? { phone } : {}),
        },
      })
      navigate({ to: '/dashboard/customers' })
    },
  })

  return (
    <div className="flex flex-col flex-1 gap-6 p-4 sm:p-6 max-w-6xl">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard/customers">Customers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Customer</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Add New Customer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a customer account and send them their login credentials.
          </p>
        </div>
      </div>

      <Separator />

      {/* Body — two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left: form ── */}
        <div className="lg:col-span-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">
                  Contact Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Primary details used to identify and contact the customer.
                </CardDescription>
              </CardHeader>

              <Separator />

              <CardContent className="pt-6 space-y-6">
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
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium"
                      >
                        Email address{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="john.doe@company.com"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        autoComplete="email"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>

                {/* First / Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.Field
                    name="firstName"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'First name is required'
                          : value.length < 2
                            ? 'Minimum 2 characters'
                            : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          First name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="text"
                          placeholder="John"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          autoComplete="given-name"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="lastName"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'Last name is required'
                          : value.length < 2
                            ? 'Minimum 2 characters'
                            : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          Last name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="text"
                          placeholder="Doe"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          autoComplete="family-name"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Phone */}
                <form.Field
                  name="phone"
                  validators={{
                    onChange: ({ value }) =>
                      value && value.length > 0 && value.length < 8
                        ? 'Minimum 8 characters'
                        : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          Phone number
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      </div>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(e.target.value || undefined)
                        }
                        onBlur={field.handleBlur}
                        autoComplete="tel"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>
                {isError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action bar */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="outline" type="button" asChild>
                <Link to="/dashboard/customers">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isPending} className="min-w-32">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Customer
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Right: info panel ── */}
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Login credentials will be sent</p>
              <p className="text-xs leading-relaxed opacity-80">
                A welcome email containing the customer's temporary password and
                login link will be dispatched immediately after account
                creation.
              </p>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                Field Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex justify-between items-start">
                <span>Email</span>
                <Badge variant="destructive" className="text-[10px]">
                  Required
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-start">
                <span>First &amp; Last name</span>
                <Badge variant="destructive" className="text-[10px]">
                  Required
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-start">
                <span>Phone number</span>
                <Badge variant="secondary" className="text-[10px]">
                  Optional
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              A secure temporary password is auto-generated and emailed to the
              customer. They will be prompted to change it on first login.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
