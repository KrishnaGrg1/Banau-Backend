import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/account/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/account/orders/"!</div>
}
