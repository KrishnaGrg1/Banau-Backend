import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/account/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/account/login"!</div>
}
