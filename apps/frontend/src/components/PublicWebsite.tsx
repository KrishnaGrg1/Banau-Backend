import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWebsiteStore } from '@/lib/stores/website.stores'

export function PublicWebsite() {
  const { website } = useWebsiteStore()

  // if (loading) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <p className="text-gray-600">Loading website…</p>
  //     </div>
  //   )
  // }

  if (!website) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Website Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            This website does not exist or has not been published yet.
          </CardContent>
        </Card>
      </div>
    )
  }

  const siteName =
    website.name ||
    website.subdomain.charAt(0).toUpperCase() + website.subdomain.slice(1)
  return (
    <div className="min-h-screen ">
      {/* HERO */}
      <header className="border-b ">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">{siteName}</h1>
          <p className="mt-3 text-gray-600">
            Welcome to the official website of {siteName}
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl space-y-10">
          <Card>
            <CardHeader>
              <CardTitle>About This Website</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              {/* {data.description || */}
              'This website is powered by Banau. You can manage and customize it
              from your admin dashboard.
              {/* '} */}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Site Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Subdomain</p>
                  <p className="text-gray-600">{website.subdomain}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Status</p>
                  <p className="text-green-600 font-medium">Published</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Powered By</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Banau helps you build and manage modern subdomain-based websites
                with ease.
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t  py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} {siteName}. Powered by{' '}
          <span className="font-semibold text-gray-900">Banau</span>
        </div>
      </footer>
    </div>
  )
}
