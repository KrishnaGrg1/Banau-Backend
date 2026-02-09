import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useVerify } from '@/hooks/user-auth'
import { VerifyUserSchema } from '@repo/shared'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { z } from 'zod'

const verifySearchSchema = z.object({
  userId: z.string().optional(),
})

export const Route = createFileRoute('/verify')({
  validateSearch: verifySearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { userId } = Route.useSearch()
  const { mutate: verify, isPending, error } = useVerify()
  const form = useForm({
    defaultValues: {
      userId: userId || '',
      token: '',
    },
    validators: {
      onSubmit: VerifyUserSchema,
    },
    onSubmit: async ({ value }) => {
      verify({ data: value })
    },
  })
  return (
    <div className="flex min-h-screen items-center justify-center ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Veify Account</CardTitle>
          <CardDescription>
            Create your account to start building websites
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
              name="token"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Token is required' : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Enter Otp</Label>
                  <InputOTP
                    id="digits-only"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  {field.state.meta.errors && (
                    <p className="text-sm text-red-600">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0]?.message ||
                          'Validation error'}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {error && (
              <div className="rounded-md  p-1">
                <p className="text-sm text-red-800">{error?.message}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || form.state.values.token.length !== 6}
            >
              {isPending ? 'Verifying...' : 'Verify Account'}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate({ to: '/login' })}
                className="text-blue-600 hover:underline"
              >
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
