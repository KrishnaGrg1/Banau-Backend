import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/contact"!</div>
}
