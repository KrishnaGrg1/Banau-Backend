import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/inventory/low-stock')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/inventory/low-stock"!</div>
}
