import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/cart"!</div>
}
