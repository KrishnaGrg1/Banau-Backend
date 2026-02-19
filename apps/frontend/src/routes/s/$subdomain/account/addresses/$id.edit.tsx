import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/s/$subdomain/account/addresses/$id/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/account/addresses/$id/edit"!</div>
}
