import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useGetAllProducts, useUpdateStock } from '@/hooks/use-product'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/dashboard/inventory/adjustments')({
  component: RouteComponent,
})

function RouteComponent() {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [actions, setActions] = useState<
    Record<string, 'set' | 'add' | 'subtract'>
  >({})

  const { data, isLoading, error } = useGetAllProducts({ limit: 50, offset: 0 })
  const updateStock = useUpdateStock()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) return <div>{error.message}</div>

  const products: any[] = Array.isArray(data?.data?.existingProducts)
    ? data.data.existingProducts
    : []

  const handleAdjust = async (productId: string) => {
    const quantity = quantities[productId]
    const action = actions[productId] ?? 'set'
    if (quantity === undefined || Number.isNaN(quantity)) return

    await updateStock.mutateAsync({
      productId,
      stock: {
        quantity: Number(quantity),
        action,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Adjustments</h1>
        <p className="text-muted-foreground mt-1">
          Adjust stock quantities for your products.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjust Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="grid gap-2 md:grid-cols-5 items-center border-b pb-3"
            >
              <div className="md:col-span-2">
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  Current: {product.quantity}
                </p>
              </div>

              <Select
                value={actions[product.id] ?? 'set'}
                onValueChange={(value: 'set' | 'add' | 'subtract') =>
                  setActions((prev) => ({ ...prev, [product.id]: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set</SelectItem>
                  <SelectItem value="add">Add</SelectItem>
                  <SelectItem value="subtract">Subtract</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Qty"
                value={quantities[product.id] ?? ''}
                onChange={(event) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [product.id]: Number(event.target.value),
                  }))
                }
              />

              <Button
                onClick={() => handleAdjust(product.id)}
                disabled={updateStock.isPending}
              >
                Apply
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
