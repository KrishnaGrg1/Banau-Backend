import { createFileRoute, redirect } from '@tanstack/react-router'
import { PublicTenant } from '@/components/PublicTenant'
// import { useWebsiteStore } from '@/lib/stores/website.stores'
import { getServerData } from '@/utils/middleware'

export const Route = createFileRoute('/')({
  loader: async () => {
    const data = await getServerData()
    if (!data?.subdomain) {
      throw redirect({
        to: '/login',
      })
    }

    return data
  },
  component: IndexPage,
})

function IndexPage() {
  const data = Route.useLoaderData()
  console.log('aslkdjf;a', data)
  // useEffect(() => {
  //   if (subdomain && (!website || website.subdomain !== subdomain)) {
  //     fetchWebsite(subdomain)
  //   }
  // }, [subdomain, website, fetchWebsite])
  if (!data?.subdomain) return null

  return <PublicTenant tenant={data.tenant} />
}
