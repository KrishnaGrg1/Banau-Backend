import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/categories/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/categories/new"!</div>
}
