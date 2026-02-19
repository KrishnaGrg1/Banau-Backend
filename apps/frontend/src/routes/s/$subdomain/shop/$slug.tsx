import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/shop/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/shop/$slug"!</div>
}
