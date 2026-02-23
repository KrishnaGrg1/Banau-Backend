import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { PublicTenant } from '@/components/PublicTenant'

const parentRoute = getRouteApi('/s/$subdomain')

export const Route = createFileRoute('/s/$subdomain/')({
  component: PreviewPage,
})

function PreviewPage() {
  const { data } = parentRoute.useLoaderData()
  const logo = data?.logo

  return (
    <PublicTenant
      tenant={data?.existingTenant}
      setting={data?.existingSetting}
      logo={logo?.url}
    />
  )
}
