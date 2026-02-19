import { createFileRoute, redirect } from '@tanstack/react-router'
import { PublicTenant } from '@/components/PublicTenant'
// import { useWebsiteStore } from '@/lib/stores/website.stores'
import { getServerData } from '@/utils/middleware'
import { useBrandTheme } from '@/hooks/use-brand-theme'
import Home from '@/components/home'

export const Route = createFileRoute('/')({
  loader: async () => {
    const data = await getServerData()
    // Remove redirect to login, just return data
    return data
  },
  component: IndexPage,
})

async function IndexPage() {
  const data = Route.useLoaderData()
  console.log('aslkdjf;a', data)
  // useEffect(() => {
  //   if (subdomain && (!website || website.subdomain !== subdomain)) {
  //     fetchWebsite(subdomain)
  //   }
  // }, [subdomain, website, fetchWebsite])

  const setting = data.tenant?.existingSetting
  const logo = data.tenant?.logo
  const favicon = data.tenant?.favicon
  if (setting && data?.subdomain && logo && favicon) {
    useBrandTheme(setting, logo, favicon, data.subdomain)
  }
  if (!data?.subdomain) return <Home />

  return (
    <PublicTenant
      tenant={data.tenant?.existingTenant}
      setting={data.tenant?.existingSetting}
    />
  )
}
