import { createFileRoute, redirect } from '@tanstack/react-router'
import { PublicTenant } from '@/components/PublicTenant'
// import { useGetTenantBySubdomain } from '@/hooks/use-tenant'
import { getTenantDetailsBySubdomain } from '@/lib/services/tenant.service'
import { useBrandTheme } from '@/hooks/use-brand-theme'

export const Route = createFileRoute('/preview/$subdomain')({
  loader: async ({ params }) => {
    const { subdomain } = params

    if (!subdomain) {
      throw redirect({ to: '/login' })
    }

    try {
      const data = await getTenantDetailsBySubdomain({
        data: { subdomain },
      })
      return { data }
    } catch (error) {
      return { tenant: null }
    }
  },
  component: PreviewPage,
})

function PreviewPage() {
  const { data } = Route.useLoaderData()
  const tenant = data?.existingTenant
  const setting = data?.existingSetting
  const logo = data?.logo
  const favicon = data?.favicon

  if (setting && tenant?.subdomain && logo && favicon) {
    useBrandTheme(setting, logo, favicon, tenant.subdomain)
  }
  return (
    <PublicTenant
      tenant={data?.existingTenant}
      setting={data?.existingSetting}
    />
  )
}
