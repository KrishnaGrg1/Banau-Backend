import { formatNprCurrency } from '@/lib/currency'

export function formatCurrency(value: string | number) {
  return formatNprCurrency(value, {
    fallback: '—',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
}

const AVATAR_PALETTE = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
]

export function avatarColor(id: string) {
  const idx =
    id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_PALETTE.length
  return AVATAR_PALETTE[idx]
}
