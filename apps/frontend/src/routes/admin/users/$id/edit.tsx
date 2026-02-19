import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/users/$id/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/users/$id/edit"!</div>
}
