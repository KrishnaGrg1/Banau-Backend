import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RegisterCustomerDtoSchema } from '@repo/shared'
import { useCustomerRegister } from '@/hooks/use-customer-auth'
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'

export const Route = createFileRoute('/s/$subdomain/account/register')({
  component: RegisterPageComponent,
})

function RegisterPageComponent() {
  const { subdomain } = Route.useParams()
  const navigate = useNavigate()
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const {
    mutate: registerMutation,
    isPending,
    error: registerError,
    isSuccess,
  } = useCustomerRegister()

  useEffect(() => {
    if (!isSuccess) return
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          navigate({
            to: '/s/$subdomain/account/profile',
            params: { subdomain },
          })
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isSuccess, navigate, subdomain])

  const form = useForm({
    defaultValues: {
      subdomain: subdomain,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        setPasswordError('Passwords do not match')
        return
      }
      setPasswordError(null)
      const { confirmPassword, ...registerData } = value
      registerMutation({ data: registerData })
    },
  })

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/s/$subdomain" params={{ subdomain }}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm">
            Register to access your account and track orders
          </p>
        </div>

        {isSuccess && countdown !== null ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold">
                Registration successful!
              </h2>
              <p className="text-sm leading-relaxed">
                Your account has been created. You'll be redirected shortly.
              </p>
            </div>
            <div className="text-xs">
              Redirecting in{' '}
              <span className="font-semibold tabular-nums">{countdown}s</span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <div className="space-y-4">
              <input type="hidden" name="subdomain" value={subdomain} />

              <div className="grid grid-cols-2 gap-3">
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
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>First name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="John"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="rounded-xl h-11"
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
                        ? 'Required'
                        : value.length < 2
                          ? 'Min 2 characters'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>Last name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="Doe"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="rounded-xl h-11"
                        autoComplete="family-name"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>
              </div>

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
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="rounded-xl h-11"
                      autoComplete="email"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Phone (optional)</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      placeholder="+977 98xxxxxxxx"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="rounded-xl h-11"
                      autoComplete="tel"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? 'Password is required'
                      : value.length < 8
                        ? 'Password must be at least 8 characters'
                        : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      placeholder="Min. 8 characters"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="rounded-xl h-11"
                      autoComplete="new-password"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="confirmPassword"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'Please confirm your password' : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Confirm password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="rounded-xl h-11"
                      autoComplete="new-password"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              {(passwordError || registerError) && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    {passwordError ?? registerError?.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-4 mt-6">
              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm">
                Already have an account?{' '}
                <Link
                  to="/s/$subdomain/account/login"
                  params={{ subdomain }}
                  className="font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors?.length) return null
  const msg =
    typeof errors[0] === 'string' ? errors[0] : (errors[0] as any)?.message
  if (!msg) return null
  return <p className="text-xs text-destructive">{msg}</p>
}
