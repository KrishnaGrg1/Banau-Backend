import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/about"!</div>
}
