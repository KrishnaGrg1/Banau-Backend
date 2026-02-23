import { useBrandTheme } from '@/hooks/use-brand-theme'
import { useForceLightMode } from '@/hooks/use-light-mode'
import { getTenantDetailsBySubdomain } from '@/lib/services/tenant.service'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import Header from '@/components/ClientComponents/Headers'
import StoreFooter from '@/components/ClientComponents/StoreFooter'

export const Route = createFileRoute('/s/$subdomain')({
  loader: async ({ params }) => {
    const { subdomain } = params
    if (!subdomain) throw redirect({ to: '/login' })
    try {
      const data = await getTenantDetailsBySubdomain({ data: { subdomain } })
      return { data }
    } catch {
      return { tenant: null }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  const tenant = data?.existingTenant
  const setting = data?.existingSetting
  const logo = data?.logo
  const favicon = data?.favicon

  if (setting && tenant?.subdomain && logo && favicon) {
    useBrandTheme(setting, logo, favicon, tenant.subdomain)
  }
  useForceLightMode(true)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ✅ Shared navbar across all child routes */}
      <Header tenant={tenant} logo={logo ? { url: logo.url } : undefined} />

      <main className="flex-1">
        <Outlet />
      </main>

      <StoreFooter tenant={tenant} />
    </div>
  )
}
