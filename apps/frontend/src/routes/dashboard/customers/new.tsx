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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCustomerCreate } from '@/hooks/use-customer'
import { FieldError } from '@/routes/(auth)/login'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  CircleHelp,
  Info,
  Lock,
  Loader2,
  Mail,
  ShieldCheck,
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
        data: { ...rest, ...(phone ? { phone } : {}) },
      })
      navigate({ to: '/dashboard/customers' })
    },
  })

  return (
    <TooltipProvider>
      <div className="flex flex-col flex-1 gap-6 p-4 sm:p-8 max-w-6xl">
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

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Add New Customer
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a customer account and send them their login credentials.
            </p>
          </div>
        </div>

        <Separator />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── Left: single form card ── */}
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
                    Customer Details
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Primary details used to identify and contact the customer.
                  </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent className="pt-5 flex flex-col gap-3">
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
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Label
                            htmlFor={field.name}
                            className="text-sm font-medium"
                          >
                            Email address{' '}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CircleHelp className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="text-xs max-w-48"
                            >
                              Login credentials and order confirmations will be
                              sent to this address.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          placeholder="john.doe@company.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          autoComplete="email"
                          className="h-9"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>

                  {/* First / Last name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <div className="flex flex-col gap-1.5">
                          <Label
                            htmlFor={field.name}
                            className="text-sm font-medium"
                          >
                            First name{' '}
                            <span className="text-destructive">*</span>
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
                            className="h-9"
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
                        <div className="flex flex-col gap-1.5">
                          <Label
                            htmlFor={field.name}
                            className="text-sm font-medium"
                          >
                            Last name{' '}
                            <span className="text-destructive">*</span>
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
                            className="h-9"
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
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={field.name}
                            className="text-sm font-medium"
                          >
                            Phone number
                          </Label>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 font-normal"
                          >
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
                          className="h-9"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>

                  {/* Server error */}
                  {isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {(error as any)?.data?.message ??
                          error?.message ??
                          'Something went wrong.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Action bar */}
              <div className="flex items-center justify-between mt-5">
                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive">*</span> Required fields
                </p>
                <div className="flex items-center gap-2.5">
                  <Button variant="outline" size="sm" type="button" asChild>
                    <Link to="/dashboard/customers">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="min-w-36 gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create Customer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* ── Right: sidebar ── */}
          <div className="flex flex-col gap-3">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-medium mb-1">
                  Credentials sent automatically
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A welcome email with a temporary password and login link is
                  dispatched immediately after account creation.
                </p>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  Field Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-xs text-muted-foreground">
                {[
                  { label: 'Email address', required: true },
                  { label: 'First & Last name', required: true },
                  { label: 'Phone number', required: false },
                ].map((row, i, arr) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between px-6 py-2.5">
                      <span>{row.label}</span>
                      <Badge
                        variant={row.required ? 'destructive' : 'secondary'}
                        className="text-[10px] px-1.5"
                      >
                        {row.required ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    {i < arr.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    A secure temporary password is auto-generated and never
                    stored in plain text.
                  </span>
                </div>
                <Separator />
                <div className="flex items-start gap-2.5">
                  <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    Customer is prompted to change their password on first
                    login.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
