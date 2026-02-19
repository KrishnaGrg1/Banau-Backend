import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/setting/features')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/setting/features"!</div>
}
