import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useVerify } from '@/hooks/user-auth'
import { z } from 'zod'
import { useEffect } from 'react'

const verifySearchSchema = z.object({
  id: z.string(),
  token: z.coerce.string(),
})

export const Route = createFileRoute('/verify')({
  validateSearch: verifySearchSchema,
  component: VerifyPage,
})

function VerifyPage() {
  const navigate = useNavigate()
  const { id, token } = Route.useSearch()
  const { mutate: verify, isPending, error, isSuccess } = useVerify()

  // Auto-verify when page loads
  useEffect(() => {
    verify({
      data: {
        token,
        userId: id,
      },
    })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {isPending && 'Verifying your email...'}
            {isSuccess && 'Email verified successfully!'}
            {error && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending && (
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-800">
                Your email has been verified successfully! You can now log in to
                your account.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error.message}</p>
            </div>
          )}

          {(isSuccess || error) && (
            <Button
              onClick={() => navigate({ to: '/login' })}
              className="w-full"
            >
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
