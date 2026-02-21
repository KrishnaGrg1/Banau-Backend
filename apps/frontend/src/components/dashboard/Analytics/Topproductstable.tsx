import type { TopProduct } from './types'

interface TopProductsTableProps {
  data: TopProduct[]
  onViewAll?: () => void
}

const BAR_COLORS = [
  'var(--primary)',
  'var(--accent)',
  'var(--secondary)',
  'var(--muted)',
  'var(--border)',
]

export function TopProductsTable({ data, onViewAll }: TopProductsTableProps) {
  const maxSold = data[0]?.sold ?? 1

  return (
    <div className="rounded-2xl p-6 shadow-sm border bg-background">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Top Products</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            By units sold this period
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-muted-foreground hover:underline transition-colors"
          >
            View all →
          </button>
        )}
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {data.map((product, i) => {
          const pct = (product.sold / maxSold) * 100
          return (
            <div key={product.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                    #{i + 1}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {product.name}
                  </span>
                  {product.status === 'ARCHIVED' && (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Archived
                    </span>
                  )}
                  {product.status === 'DRAFT' && (
                    <span className="shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      Draft
                    </span>
                  )}
                </div>
                <div className="ml-3 flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {product.sold} sold
                  </span>
                  <span className="text-xs font-semibold">
                    ${product.revenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: BAR_COLORS[i] ?? 'var(--border)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
