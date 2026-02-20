import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { useRegister } from '@/hooks/user-auth'
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export const Route = createFileRoute('/(auth)/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const {
    mutate: registerMutation,
    isPending,
    error: registerError,
    isSuccess,
  } = useRegister()

  useEffect(() => {
    if (!isSuccess) return
    setCountdown(10)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          navigate({ to: '/login' })
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isSuccess])

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
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
    <div className="flex min-h-screen bg-background">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-border bg-card p-12">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            banau
          </span>
        </a>

        {/* Feature list */}
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              What you get
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-snug">
              Everything you need
              <br />
              to sell online.
            </h2>
          </div>
          <ul className="space-y-4">
            {[
              {
                title: 'Your own subdomain',
                body: 'Get yourname.banau.com live instantly.',
              },
              {
                title: 'Full brand control',
                body: 'Colors, logo, and landing page — all yours.',
              },
              {
                title: 'Orders & customers',
                body: 'Manage everything from one clean dashboard.',
              },
              {
                title: 'Built-in analytics',
                body: 'Track revenue, traffic, and growth over time.',
              },
            ].map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                  <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {f.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <p className="text-xs text-muted-foreground">
          Free to start · No credit card required
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile brand */}
        <a href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            banau
          </span>
        </a>

        <div className="w-full max-w-sm space-y-8">
          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start building your store — free, no card needed.
            </p>
          </div>

          {/* Success state */}
          {isSuccess && countdown !== null ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold text-foreground">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We've sent a verification link to your email. Click it to
                    activate your account.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Redirecting to login in{' '}
                  <span className="font-semibold text-foreground tabular-nums">
                    {countdown}s
                  </span>
                </div>
              </div>
              <Button
                className="w-full h-11 rounded-xl"
                onClick={() => navigate({ to: '/login' })}
              >
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            /* Form */
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-4"
            >
              {/* Name row */}
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
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        First name
                      </Label>
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
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        Last name
                      </Label>
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
                      className="text-sm font-medium text-foreground"
                    >
                      Email
                    </Label>
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

              {/* Password */}
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? 'Password is required'
                      : value.length < 6
                        ? 'Password must be at least 6 characters'
                        : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      Password
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      placeholder="Min. 6 characters"
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

              {/* Confirm Password */}
              <form.Field
                name="confirmPassword"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'Please confirm your password' : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      Confirm password
                    </Label>
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

              {/* Server / password mismatch error */}
              {(passwordError || registerError) && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    {passwordError ?? registerError?.message}
                  </p>
                </div>
              )}

              {/* Submit */}
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

              {/* Login link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate({ to: '/login' })}
                  className="font-semibold text-foreground hover:underline underline-offset-4 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── FieldError ────────────────────────────────────────────────────────────────

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors?.length) return null
  const msg =
    typeof errors[0] === 'string' ? errors[0] : (errors[0] as any)?.message
  if (!msg) return null
  return <p className="text-xs text-destructive">{msg}</p>
}
