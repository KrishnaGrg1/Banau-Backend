// Product List Page

// Product Detail/Edit Page
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/products/')({
  component: ProductsPage,
})
export default function ProductsPage() {
  return <div>Product List (CRUD coming soon)</div>
}
