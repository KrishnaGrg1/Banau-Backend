import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/account/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/account/register"!</div>
}
