import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/checkout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/checkout/"!</div>
}
