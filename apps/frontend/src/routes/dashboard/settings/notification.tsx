import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/settings/notification')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/settings/notification"!</div>
}
