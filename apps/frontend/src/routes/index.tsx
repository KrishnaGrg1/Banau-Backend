import { createFileRoute } from '@tanstack/react-router'
import { PublicWebsite } from '@/components/PublicWebsite'
// import { useWebsiteStore } from '@/lib/stores/website.stores'
import { getServerData } from '@/utils/middleware'

export const Route = createFileRoute('/')({
  loader: () => {
    return getServerData()
  },
  component: IndexPage,
})

function IndexPage() {
  const { subdomain } = Route.useLoaderData()

  // useEffect(() => {
  //   if (subdomain && (!website || website.subdomain !== subdomain)) {
  //     fetchWebsite(subdomain)
  //   }
  // }, [subdomain, website, fetchWebsite])

  if (subdomain) {
    return <PublicWebsite />
  }

  return null
}
