import { useAcceptInvite } from '@/hooks/use-staff-management'
import { AcceptInviteDtoSchema } from '@repo/shared'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Loader2, Sparkles, MailOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/(auth)/accept-invite')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
})

function RouteComponent() {
  const { token } = Route.useSearch()
  const { mutateAsync, isPending, error } = useAcceptInvite()
  const form = useForm({
    defaultValues: {
      token: token,
      firstName: '',
      lastName: '',
    },
    validators: {
      onSubmit: AcceptInviteDtoSchema,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({ data: value })
    },
  })

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-border bg-card p-12">
        <a href="/" className="flex items-center gap-2.5 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            banau
          </span>
        </a>

        <div className="space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <MailOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-snug">
              Welcome to
              <br />
              your team.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Complete your profile to get started and begin collaborating with
              your team.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Questions? Contact your administrator.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <a href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight">banau</span>
        </a>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">
              Create Staff Member
            </h1>
            <p className="text-sm text-muted-foreground">
              Add your details to complete the invitation.
            </p>
          </div>

          <Card className="border-border">
            <CardContent className="pt-6">
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  form.handleSubmit()
                }}
              >
                <form.Field name="token">
                  {(field) => (
                    <input
                      type="hidden"
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                </form.Field>

                <div className="space-y-4">
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
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>First Name</Label>
                        <Input
                          id={field.name}
                          placeholder="John"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldError
                          errors={field.state.meta.errors?.map((e) =>
                            typeof e === 'string' ? { message: e } : e,
                          )}
                        />
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
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Last Name</Label>
                        <Input
                          id={field.name}
                          placeholder="Doe"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldError
                          errors={field.state.meta.errors?.map((e) =>
                            typeof e === 'string' ? { message: e } : e,
                          )}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error.message}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 rounded-xl font-semibold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Staff Member'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Having trouble?{' '}
                  <a
                    href="mailto:support@banau.com"
                    className="font-medium hover:underline underline-offset-4"
                  >
                    Contact support
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
