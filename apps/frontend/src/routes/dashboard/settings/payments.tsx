import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/settings/payments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/settings/payment"!</div>
}
