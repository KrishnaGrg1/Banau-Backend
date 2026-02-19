import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/checkout/failed')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/checkout/failed"!</div>
}
