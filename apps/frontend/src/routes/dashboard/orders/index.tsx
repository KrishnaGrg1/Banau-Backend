// Order List Page

// Order Detail/Edit Page
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/orders/')({
  component: OrdersPage,
})
export default function OrdersPage() {
  return <div>Order List (CRUD coming soon)</div>
}
