// Product Detail/Edit Page
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/products/$id/')({
  loader: async ({ params }) => {
    const { id } = params

    return id
  },
  component: ProductDetailPage,
})

export default function ProductDetailPage() {
  const id = Route.useLoaderData()
  return <div>Product Detail/Edit (CRUD coming soon) {id}</div>
}
