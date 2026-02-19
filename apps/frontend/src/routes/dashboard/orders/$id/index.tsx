// Order Detail/Edit Page
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/orders/$id/')({
  loader: async ({ params }) => {
    const { id } = params

    return id
  },
  component: OrderDetailPage,
})

export default function OrderDetailPage() {
  const id = Route.useLoaderData()
  return <div>Order Detail/Edit (CRUD coming soon) {id}</div>
}
