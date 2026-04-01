interface FormatNprCurrencyOptions {
  fallback?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

const defaultFormatter = new Intl.NumberFormat('en-NP', {
  style: 'currency',
  currency: 'NPR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatNprCurrency(
  value: string | number | null | undefined,
  options?: FormatNprCurrencyOptions,
): string {
  const {
    fallback = '—',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options ?? {}

  const parsed =
    typeof value === 'string'
      ? Number.parseFloat(value)
      : typeof value === 'number'
        ? value
        : Number.NaN

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  if (minimumFractionDigits === 2 && maximumFractionDigits === 2) {
    return defaultFormatter.format(parsed)
  }

  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(parsed)
}
