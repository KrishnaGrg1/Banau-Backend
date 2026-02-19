import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/customers/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/customers/$id/"!</div>
}
