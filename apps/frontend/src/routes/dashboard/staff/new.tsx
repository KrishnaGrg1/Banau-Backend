import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/staff/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/staff/new"!</div>
}
