// routes/index.tsx
import StoreFooter from '#/components/ClientComponents/StoreFooter'
import { PublicTenant } from '#/components/PublicTenant'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { tenantConfig } = useLoaderData({ from: '__root__' })

  if (!tenantConfig) return <h1>404: Tenant Not Found</h1>
  return (
    <div>
      <PublicTenant tenant={tenantConfig.existingTenant} setting={tenantConfig.existingSetting} />
      <StoreFooter tenant={tenantConfig.existingTenant} />
    </div>
  )
}
