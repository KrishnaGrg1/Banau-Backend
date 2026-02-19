import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/settings/domain')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/settings/domain"!</div>
}
