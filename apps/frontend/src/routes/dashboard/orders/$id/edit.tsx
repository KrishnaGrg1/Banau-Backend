import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/orders/$id/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/orders/$id/edit"!</div>
}
