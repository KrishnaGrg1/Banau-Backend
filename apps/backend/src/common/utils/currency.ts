export function formatNprCurrency(value: string | number | null | undefined): string {
  const parsed =
    typeof value === 'string'
      ? Number.parseFloat(value)
      : typeof value === 'number'
        ? value
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 2,
    }).format(0);
  }

  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 2,
  }).format(parsed);
}
