import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/inventory/adjustment')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/inventory/adjustment"!</div>
}
