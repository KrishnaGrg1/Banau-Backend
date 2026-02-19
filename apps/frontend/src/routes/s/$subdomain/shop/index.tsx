import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/shop/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/shop/"!</div>
}
