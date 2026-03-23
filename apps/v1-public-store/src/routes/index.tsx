// routes/index.tsx
import Header from '#/components/ClientComponents/Headers'
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
    // <main className="p-6">
    //   <img src={tenantConfig.logo.url} alt="Logo" width={100} />
    //   <h1>Welcome to {tenantConfig.existingSetting.landingPageTitle}</h1>
    // </main>
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        tenant={tenantConfig.existingTenant}
        logo={tenantConfig.logo ? { url: tenantConfig.logo.url } : undefined}
      />
      <main className="flex-1">
        <PublicTenant tenant={tenantConfig.existingTenant} setting={tenantConfig.existingSetting} />
        <StoreFooter tenant={tenantConfig.existingTenant} />
      </main>
    </div>
  )
}
