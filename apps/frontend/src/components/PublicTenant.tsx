import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { usetenantStore } from '@/lib/stores/tenant.stores'
import { Tenant } from '@repo/db/dist/generated/prisma/client'
import { Button } from './ui/button'
import { Link } from '@tanstack/react-router'

interface PublicTenantProps {
  tenant?: Tenant | null
}

export function PublicTenant({ tenant }: PublicTenantProps) {
  // const { tenant } = usetenantStore()
  console.log('data ', tenant)

  // Determine if we're on a subdomain
  const isSubdomain =
    typeof window !== 'undefined' &&
    window.location.hostname.includes('.localhost') &&
    !window.location.hostname.startsWith('www.')

  // Build dashboard URL based on context
  const dashboardUrl = isSubdomain
    ? `http://localhost:3000/dashboard` // From subdomain, go to main domain
    : '/dashboard' // From main domain, use relative path
  // if (loading) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <p className="text-gray-600">Loading tenant…</p>
  //     </div>
  //   )
  // }

  if (!tenant) {
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

  if (!tenant.published) {
    return (
      <div className="flex min-h-screen items-center justify-center  p-4">
        <Card className="w-full max-w-lg text-center shadow-lg">
          <CardHeader className="space-y-4 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <p className="text-gray-600 text-base">
              This website is currently under construction and hasn't been
              published yet by the owner.
            </p>

            <div className=" rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Website Details
              </p>
              <div className="grid grid-cols-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium text-gray-900">
                    {tenant.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium  text-amber-800">
                    Unpublished
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-3">
                Are you the owner of this website?
              </p>
              {isSubdomain ? (
                <Button asChild>
                  <a href={dashboardUrl}>Go to Dashboard</a>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-400 pt-2">Powered by Banau</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const siteName =
    tenant.name ||
    tenant.subdomain.charAt(0).toUpperCase() + tenant.subdomain.slice(1)
  return (
    <div className="min-h-screen ">
      {/* HERO */}
      <header className="border-b ">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">{siteName}</h1>
          <p className="mt-3 text-gray-600">
            Welcome to the official tenant of {siteName}
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl space-y-10">
          <Card>
            <CardHeader>
              <CardTitle>About This tenant</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              {/* {data.description || */}
              This tenant is powered by Banau. You can manage and customize it
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
                  <p className="text-gray-600">{tenant.subdomain}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Status</p>
                  <p className="text-green-600 font-medium">
                    {tenant.published ? (
                      <div>Published</div>
                    ) : (
                      <div>Unpublished</div>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Powered By</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <div>
                  Banau helps you build and manage modern subdomain-based
                  tenants with ease.
                </div>
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
