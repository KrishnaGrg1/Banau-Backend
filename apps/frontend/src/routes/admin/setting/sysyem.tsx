import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/setting/sysyem')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/setting/sysyem"!</div>
}
