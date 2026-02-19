import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/categories/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/categories/$slug"!</div>
}
