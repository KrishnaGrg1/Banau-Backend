import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/users/roles')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/users/roles"!</div>
}
