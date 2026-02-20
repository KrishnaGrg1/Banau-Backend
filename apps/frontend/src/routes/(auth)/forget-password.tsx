import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForgotPassword } from '@/hooks/user-auth'
import {
  Loader2,
  AlertCircle,
  MailOpen,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/(auth)/forget-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const {
    mutate: forgotPassword,
    isPending,
    error,
    isSuccess,
  } = useForgotPassword()

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      forgotPassword({ data: value })
    },
  })

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left panel ── */}
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

        {/* Illustration */}
        <div className="space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <MailOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-snug">
              Happens to
              <br />
              the best of us.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Enter the email address you used to register and we'll send you a
              link to reset your password.
            </p>
          </div>
          <ul className="space-y-2">
            {[
              'Link is valid for 1 hour',
              'Check your spam folder too',
              'You can request a new link anytime',
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Remember it?{' '}
          <button
            onClick={() => navigate({ to: '/login' })}
            className="font-medium text-foreground hover:underline underline-offset-4 transition-colors"
          >
            Sign in instead
          </button>
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
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate({ to: '/login' })}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </button>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              We'll send a reset link to your inbox.
            </p>
          </div>

          {/* Success state */}
          {isSuccess ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MailOpen className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    Check your inbox
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If an account exists for that email, you'll receive a
                    password reset link within a few minutes.
                  </p>
                </div>
              </div>
              <Button
                className="w-full h-11 rounded-xl text-sm font-semibold"
                onClick={() => navigate({ to: '/login' })}
              >
                Back to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Didn't get it?{' '}
                <button
                  type="button"
                  onClick={() => form.handleSubmit()}
                  className="font-medium text-foreground hover:underline underline-offset-4"
                >
                  Resend
                </button>
              </p>
            </div>
          ) : (
            /* Form */
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-5"
            >
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
                      Email address
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
                      autoFocus
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error.message}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link…
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate({ to: '/register' })}
                  className="font-semibold text-foreground hover:underline underline-offset-4 transition-colors"
                >
                  Sign up free
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
