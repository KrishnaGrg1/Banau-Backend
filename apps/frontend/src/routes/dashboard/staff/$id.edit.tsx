import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/staff/$id/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/staff/$id/edit"!</div>
}
