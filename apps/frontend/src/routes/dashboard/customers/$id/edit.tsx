import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/customers/$id/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/customers/$id/edit"!</div>
}
