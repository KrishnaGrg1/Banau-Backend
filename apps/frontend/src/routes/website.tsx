import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import {
  getWebsite,
  createWebsite,
  publilshWebsite,
} from '@/lib/services/website.service'
import { useAuth } from '@/hooks/use-auth'
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
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/website')({
  component: WebsitePage,
})

function WebsitePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, authLoading, navigate])

  const { data: website, isLoading } = useQuery({
    queryKey: ['website'],
    queryFn: getWebsite,
    enabled: isAuthenticated,
  })

  const createMutation = useMutation({
    mutationFn: createWebsite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website'] })
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const publishMutation = useMutation({
    mutationFn: publilshWebsite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website'] })
    },
  })

  const form = useForm({
    defaultValues: {
      name: '',
      subdomain: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      createMutation.mutate(value)
    },
  })

  const handlePublishToggle = () => {
    publishMutation.mutate()
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Website Management</h1>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {website ? (
          // Show existing website
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Website Information</CardTitle>
                <CardDescription>Your website details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-lg font-medium">{website.name}</p>
                </div>
                <div>
                  <Label>Subdomain</Label>
                  <p className="text-lg font-medium">{website.subdomain}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Your site is available at:{' '}
                    <a
                      href={`https://${website.subdomain}.banau.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {website.subdomain}.banau.com
                    </a>
                  </p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(website.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publication Settings</CardTitle>
                <CardDescription>
                  Control your website visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Publish Status</Label>
                    <p className="text-sm text-gray-500">
                      {website.published
                        ? 'Your website is live and visible to everyone'
                        : 'Your website is currently unpublished'}
                    </p>
                  </div>
                  <Switch
                    checked={website.published}
                    onCheckedChange={handlePublishToggle}
                    disabled={publishMutation.isPending}
                  />
                </div>

                {website.published ? (
                  <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-800">
                      ✓ Your website is published and accessible at{' '}
                      <a
                        href={`https://${website.subdomain}.banau.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline"
                      >
                        {website.subdomain}.banau.com
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                      Your website is currently unpublished. Toggle the switch
                      above to make it live.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={() =>
                      navigate({ to: `/preview/${website.subdomain}` })
                    }
                    variant="outline"
                    className="w-full"
                  >
                    Preview Site (Local)
                  </Button>
                  <Button
                    onClick={() =>
                      window.open(
                        `https://${website.subdomain}.banau.com`,
                        '_blank',
                      )
                    }
                    variant="outline"
                    className="w-full"
                    disabled={!website.published}
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
              <CardTitle>Create Your Website</CardTitle>
              <CardDescription>
                Set up your new website with a unique subdomain
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
                        ? 'Website name is required'
                        : value.length < 3
                          ? 'Name must be at least 3 characters'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Website Name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="My Awesome Website"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors && (
                        <p className="text-sm text-red-600">
                          {field.state.meta.errors[0]}
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
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Your website will be accessible at{' '}
                        {field.state.value || 'your-subdomain'}.banau.com
                      </p>
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
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Website'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
