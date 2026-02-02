import { createFileRoute } from '@tanstack/react-router'
import { PublicWebsite } from '@/components/PublicWebsite'

export const Route = createFileRoute('/preview/$subdomain')({
  component: PreviewPage,
})

function PreviewPage() {
  return <PublicWebsite />
}
