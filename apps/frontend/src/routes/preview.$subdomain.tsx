import { createFileRoute } from '@tanstack/react-router'
import { PublicWebsite } from '@/components/PublicWebsite'
// import { useWebsiteStore } from '@/lib/stores/website.stores'
// import { useEffect } from 'react'

export const Route = createFileRoute('/preview/$subdomain')({
  component: PreviewPage,
})

function PreviewPage() {
  // const { subdomain } = Route.useParams()
  // const { website } = useWebsiteStore()

  // useEffect(() => {
  //   // Fetch website for this subdomain if not already loaded
  //   if (!website || website.subdomain !== subdomain) {
  //     fetchWebsite(subdomain)
  //   }
  // }, [subdomain, fetchWebsite, website])

  return <PublicWebsite />
}
