import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResetPassword } from '@/hooks/user-auth'
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/(auth)/reset-password/$token')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = Route.useParams()
  const [showPw, setShowPw] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [matchErr, setMatchErr] = useState<string | null>(null)

  const {
    mutate: resetPassword,
    isPending,
    error,
    isSuccess,
  } = useResetPassword()

  const form = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        setMatchErr('Passwords do not match')
        return
      }
      setMatchErr(null)
      resetPassword({ data: { token, password: value.password } })
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
            <ShieldCheck className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-snug">
              Create a strong
              <br />
              new password.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your new password should be different from any previously used
              passwords and hard for others to guess.
            </p>
          </div>

          {/* Password tips */}
          <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tips
            </p>
            <ul className="space-y-2">
              {[
                'At least 8 characters',
                'Mix of uppercase & lowercase',
                'Include numbers or symbols',
                'Avoid common words',
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
        </div>

        <p className="text-xs text-muted-foreground">
          Link expired?{' '}
          <button
            onClick={() => navigate({ to: '/forget-password' })}
            className="font-medium text-foreground hover:underline underline-offset-4 transition-colors"
          >
            Request a new one
          </button>
        </p>
      </div>

      {/* ── Right panel ── */}
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
              Set new password
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose a secure password for your account.
            </p>
          </div>

          {/* Success state */}
          {isSuccess ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    Password updated!
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your password has been changed successfully. You can now
                    sign in with your new password.
                  </p>
                </div>
              </div>
              <Button
                className="w-full h-11 rounded-xl text-sm font-semibold"
                onClick={() => navigate({ to: '/login' })}
              >
                Sign In Now
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
              className="space-y-5"
            >
              {/* New Password */}
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
                      New password
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPw ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="rounded-xl h-11 pr-10"
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                    {/* Strength indicator */}
                    <PasswordStrength value={field.state.value} />
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
                      Confirm new password
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showConf ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="rounded-xl h-11 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConf((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showConf ? 'Hide password' : 'Show password'
                        }
                      >
                        {showConf ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              {/* Mismatch / server error */}
              {(matchErr || error) && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    {matchErr ?? error?.message}
                  </p>
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
                    Updating password…
                  </>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Link expired?{' '}
                <button
                  type="button"
                  onClick={() => navigate({ to: '/forget-password' })}
                  className="font-medium text-foreground hover:underline underline-offset-4 transition-colors"
                >
                  Request a new one
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── PasswordStrength ──────────────────────────────────────────────────────────

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null

  const score = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length

  const levels = [
    { label: 'Weak', bars: 1, color: 'bg-destructive' },
    { label: 'Fair', bars: 2, color: 'bg-amber-500' },
    { label: 'Good', bars: 3, color: 'bg-yellow-400' },
    { label: 'Strong', bars: 4, color: 'bg-primary' },
  ]

  const level = levels[Math.min(score - 1, 3)] ?? levels[0]

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? level.color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Strength:{' '}
        <span className="font-semibold text-foreground">{level.label}</span>
      </p>
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
