import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/account/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/account/profile"!</div>
}
