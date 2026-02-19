import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/analytics/products')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/analytics/products"!</div>
}
