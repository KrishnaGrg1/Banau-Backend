import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/account/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/account/profile"!</div>
}
