import { createFileRoute, redirect } from '@tanstack/react-router'
import { PublicTenant } from '@/components/PublicTenant'
// import { useGetTenantBySubdomain } from '@/hooks/use-tenant'
import { getTenantDetailsBySubdomain } from '@/lib/services/tenant.service'

export const Route = createFileRoute('/preview/$subdomain')({
  loader: async ({ params }) => {
    const { subdomain } = params

    if (!subdomain) {
      throw redirect({ to: '/login' })
    }

    try {
      const tenant = await getTenantDetailsBySubdomain({
        data: { subdomain },
      })
      return { tenant }
    } catch (error) {
      return { tenant: null }
    }
  },
  component: PreviewPage,
})

function PreviewPage() {
  const { tenant } = Route.useLoaderData()

  return <PublicTenant tenant={tenant} />
}
