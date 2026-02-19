import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$subdomain/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$subdomain/"!</div>
}
