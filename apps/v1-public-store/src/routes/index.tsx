// routes/index.tsx
import { PublicTenant } from '#/components/PublicTenant'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { tenantConfig } = useLoaderData({ from: '__root__' })

  if (!tenantConfig) return <h1>404: Tenant Not Found</h1>

  return (
    // <main className="p-6">
    //   <img src={tenantConfig.logo.url} alt="Logo" width={100} />
    //   <h1>Welcome to {tenantConfig.existingSetting.landingPageTitle}</h1>
    // </main>
    <PublicTenant
      tenant={tenantConfig.existingTenant}
      setting={tenantConfig.existingSetting}
    />
  )
}
