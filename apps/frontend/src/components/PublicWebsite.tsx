import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublicSubdomain } from '@/utils/host'

export function PublicWebsite() {
  const subdomain = getPublicSubdomain()

  if (!subdomain) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Website Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This website is not available. Please check the URL and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const siteName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1)

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{siteName}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Welcome to {siteName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                This is your public website powered by Banau. Customize this
                page through your admin dashboard.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>About This Site</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  This website was created using Banau, a powerful platform for
                  building and managing subdomain-based websites.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Subdomain</p>
                  <p className="text-sm text-gray-600">{subdomain}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <p className="text-sm text-green-600">Published</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            Powered by{' '}
            <span className="font-semibold text-gray-900">Banau</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
