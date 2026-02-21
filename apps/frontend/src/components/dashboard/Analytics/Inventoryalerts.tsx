import type { LowStockItem } from './types'

interface InventoryAlertsProps {
  items: LowStockItem[]
  /** Threshold below which a product is considered "low stock". Default: 10 */
  threshold?: number
  onManage?: () => void
}

export function InventoryAlerts({
  items,
  threshold = 10,
  onManage,
}: InventoryAlertsProps) {
  if (!items.length) return null

  return (
    <div className="rounded-2xl border bg-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg" aria-hidden>
          ⚠️
        </span>
        <h3 className="text-sm font-semibold">Inventory Alerts</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
          {items.length} item{items.length !== 1 ? 's' : ''} low
        </span>
        {onManage && (
          <button
            onClick={onManage}
            className="text-xs font-semibold text-muted-foreground hover:underline transition-colors"
          >
            Manage →
          </button>
        )}
      </div>

      {/* Grid of low-stock items */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl bg-muted px-4 py-3 border"
          >
            <span className="text-xs font-medium truncate">{item.name}</span>
            <span
              className={`ml-2 shrink-0 text-xs font-bold ${
                item.qty <= threshold / 2
                  ? 'text-destructive'
                  : 'text-warning-foreground'
              }`}
            >
              {item.qty} left
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
