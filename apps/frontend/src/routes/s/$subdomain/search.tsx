import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/search')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/search"!</div>
}
