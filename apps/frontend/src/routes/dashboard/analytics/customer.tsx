import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/analytics/customer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/analytics/customer"!</div>
}
