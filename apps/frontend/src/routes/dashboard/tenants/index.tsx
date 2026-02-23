import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'
import {
  useCreateTenant,
  useGetTenant,
  usePublishTenant,
} from '@/hooks/use-tenant'
import { CreateTenantDtoSchema } from '@repo/shared'

export const Route = createFileRoute('/dashboard/tenants/')({
  component: TenantPage,
})

function TenantPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  // const { isLoading: authLoading } = useGetMe()

  const { data: tenant, isLoading } = useGetTenant()

  const { mutate: createTenant, isError: createTenantError } = useCreateTenant()

  const { mutate: publishTenant, isPending: isPublishing } = usePublishTenant()

  const form = useForm({
    defaultValues: {
      name: '',
      subdomain: '',
      email: '',
    },
    validators: {
      onSubmit: CreateTenantDtoSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      createTenant({ data: value })
    },
  })

  const handlePublishToggle = () => {
    publishTenant()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <header className="border-b ">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Tenant Management</h1>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {tenant ? (
          // Show existing tenant
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
                <CardDescription>Your Tenant details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-lg font-medium">{tenant.name}</p>
                </div>
                <div>
                  <Label>Subdomain</Label>
                  <p className="text-lg font-medium">{tenant.subdomain}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Your site is available at:{' '}
                    <a
                      href={`https://${tenant.subdomain}.banau.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {tenant.subdomain}.banau.com
                    </a>
                  </p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Publication Settings</CardTitle>
                <CardDescription>
                  Control your tenant visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Publish Status</Label>
                    <p className="text-sm text-gray-500">
                      {tenant.published
                        ? 'Your tenant is live and visible to everyone'
                        : 'Your tenant is currently unpublished'}
                    </p>
                  </div>
                  <Switch
                    checked={tenant.published}
                    onCheckedChange={handlePublishToggle}
                    disabled={isPublishing}
                  />
                </div>

                {tenant.published ? (
                  <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-800">
                      ✓ Your tenant is published and accessible at{' '}
                      <a
                        href={`https://${tenant.subdomain}.banau.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline"
                      >
                        {tenant.subdomain}.banau.com
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                      Your tenant is currently unpublished. Toggle the switch
                      above to make it live.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={() => navigate({ to: `/s/${tenant.subdomain}` })}
                    variant="outline"
                    className="w-full"
                  >
                    Preview Site (Local)
                  </Button>
                  <Button
                    onClick={() =>
                      window.open(
                        `https://${tenant.subdomain}.banau.com`,
                        '_blank',
                      )
                    }
                    variant="outline"
                    className="w-full"
                    disabled={!tenant.published}
                  >
                    View Live Site (Production)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Show create form
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Create Your Tenant</CardTitle>
              <CardDescription>
                Set up your new tenant with a unique subdomain
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
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? 'Tenant name is required'
                        : value.length < 3
                          ? 'Name must be at least 3 characters'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Tenant Name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="My Awesome Tenant"
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
                  name="subdomain"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? 'Subdomain is required'
                        : !/^[a-z0-9-]+$/.test(value)
                          ? 'Subdomain can only contain lowercase letters, numbers, and hyphens'
                          : value.length < 3
                            ? 'Subdomain must be at least 3 characters'
                            : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Subdomain</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={field.name}
                          name={field.name}
                          type="text"
                          placeholder="mysite"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, ''),
                            )
                          }
                          onBlur={field.handleBlur}
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          .banau.com
                        </span>
                      </div>
                      {field.state.meta.errors && (
                        <p className="text-sm text-red-600">
                          {typeof field.state.meta.errors[0] === 'string'
                            ? field.state.meta.errors[0]
                            : field.state.meta.errors[0]?.message}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Your tenant will be accessible at{' '}
                        {field.state.value || 'your-subdomain'}.banau.com
                      </p>
                    </div>
                  )}
                </form.Field>
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
                {error && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createTenantError}
                >
                  {createTenantError ? 'Creating...' : 'Create Tenant'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
