import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/account/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/account/notifications"!</div>
}
