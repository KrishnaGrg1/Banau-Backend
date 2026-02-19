import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/account/password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/account/password"!</div>
}
