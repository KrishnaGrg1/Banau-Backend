import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoginCustomerDtoSchema } from '@repo/shared'
import { useCustomerLogin } from '@/hooks/use-customer-auth'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/s/$subdomain/account/login')({
  component: LoginPageComponent,
})

function LoginPageComponent() {
  const { subdomain } = Route.useParams()
  const navigate = useNavigate()
  const { mutate: login, isPending, error: loginError } = useCustomerLogin()

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: LoginCustomerDtoSchema },
    onSubmit: async ({ value }) => {
      login(
        { data: value },
        {
          onSuccess: () => {
            navigate({
              to: '/s/$subdomain/account/profile',
              params: { subdomain },
            })
          },
        },
      )
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
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm">
            Enter your credentials to access your account
          </p>
        </div>

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
                  placeholder="••••••••"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="rounded-xl h-11"
                  autoComplete="current-password"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {loginError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{loginError.message}</p>
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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          <p className="text-center text-sm">
            Don't have an account?{' '}
            <Link
              to="/s/$subdomain/account/register"
              params={{ subdomain }}
              className="font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
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
