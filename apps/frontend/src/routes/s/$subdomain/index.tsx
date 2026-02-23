import { createFileRoute } from '@tanstack/react-router'
import { PublicTenant } from '@/components/PublicTenant'

export const Route = createFileRoute('/s/$subdomain/')({
  component: PreviewPage,
})

function PreviewPage() {
  const { data } = Route.useLoaderData()
  const logo = data?.logo

  return (
    <PublicTenant
      tenant={data?.existingTenant}
      setting={data?.existingSetting}
      logo={logo?.url}
    />
  )
}
