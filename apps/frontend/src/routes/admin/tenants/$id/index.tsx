import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tenants/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/tenants/$id/"!</div>
}
