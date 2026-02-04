import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'
import { LoginDtoSchema } from '@repo/shared'
import { useLogin } from '@/hooks/user-auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { mutate: login, isPending } = useLogin()
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: LoginDtoSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      login(value)
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Banau</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
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
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-red-600">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

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
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-red-600">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate({ to: '/register' })}
                className="text-blue-600 hover:underline"
              >
                Register
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
