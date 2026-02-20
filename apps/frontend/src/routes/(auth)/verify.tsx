import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useVerify } from '@/hooks/user-auth'
import { z } from 'zod'
import { useEffect } from 'react'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  MailOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const verifySearchSchema = z.object({
  id: z.string(),
  token: z.coerce.string(),
})

export const Route = createFileRoute('/(auth)/verify')({
  validateSearch: verifySearchSchema,
  component: VerifyPage,
})

function VerifyPage() {
  const navigate = useNavigate()
  const { id, token } = Route.useSearch()
  const { mutate: verify, isPending, error, isSuccess } = useVerify()

  useEffect(() => {
    verify({ data: { token, userId: id } })
  }, [])

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

        {/* Illustration area */}
        <div className="space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <MailOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-snug">
              One click
              <br />
              to get started.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Email verification keeps your account secure and ensures you stay
              notified about orders and store updates.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Didn't receive an email? Check your spam folder.
        </p>
      </div>

      {/* ── Right panel — status ── */}
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
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Email Verification
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPending && 'Verifying your email address…'}
              {isSuccess && 'Your email has been confirmed.'}
              {error && 'We could not verify your email.'}
            </p>
          </div>

          {/* Status card */}
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-5 text-center">
            {/* Icon */}
            {isPending && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              </div>
            )}
            {isSuccess && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            )}
            {error && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            )}

            {/* Message */}
            {isPending && (
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  Hang tight…
                </p>
                <p className="text-xs text-muted-foreground">
                  We're verifying your email address. This only takes a moment.
                </p>
              </div>
            )}
            {isSuccess && (
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  You're verified!
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your account is now active. Sign in to access your dashboard
                  and start building your store.
                </p>
              </div>
            )}
            {error && (
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  Verification failed
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {error.message ||
                    'This link may have expired or already been used. Try registering again.'}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {isSuccess && (
            <Button
              className="w-full h-11 rounded-xl text-sm font-semibold"
              onClick={() => navigate({ to: '/login' })}
            >
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {error && (
            <div className="space-y-3">
              <Button
                className="w-full h-11 rounded-xl text-sm font-semibold"
                onClick={() => navigate({ to: '/register' })}
              >
                Back to Register
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl text-sm"
                onClick={() => navigate({ to: '/login' })}
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* Footer note */}
          {!error && (
            <p className="text-center text-xs text-muted-foreground">
              Having trouble?{' '}
              <a
                href="mailto:support@banau.com"
                className="font-medium text-foreground hover:underline underline-offset-4 transition-colors"
              >
                Contact support
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
