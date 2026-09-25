/** Shared formatters / status badges for commerce Omnichannel UI (pure, reusable). */

export function formatCommerceMoney(
  amount: string | number | null | undefined,
  currency = 'IDR'
): string {
  if (amount == null || amount === '') return '—'
  const n = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(n)) return `${currency} ${amount}`
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `${currency} ${n}`
  }
}

/**
 * Normalize quantity for display: strip trailing zeros after decimal
 * so `1.0000` → `1`, `1.5000` → `1.5`, `2` → `2`.
 */
export function formatCommerceQty(value: string | number | null | undefined): string {
  if (value == null || value === '') return '—'
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return String(value)
  // Avoid scientific notation; trim trailing zeros from decimal part.
  const fixed = n.toFixed(4)
  return fixed.replace(/\.?0+$/, '')
}

/**
 * Collapse duplicate product lines (same SKU) into one row with summed quantity.
 * TikTok often emits one line_item per unit — Desty-style UI shows a single product.
 */
export function aggregateCommerceLineItems<T extends Record<string, any>>(
  items: T[] | null | undefined
): T[] {
  if (!items?.length) return []
  const map = new Map<string, T>()
  for (const item of items) {
    const key = commerceLineItemKey(item)
    const existing = map.get(key)
    if (!existing) {
      map.set(key, { ...item, quantity: toNum(item.quantity) })
      continue
    }
    const qty = toNum(existing.quantity) + toNum(item.quantity)
    const next: T = { ...existing, quantity: qty }
    if (item.lineTotalAmount != null || existing.lineTotalAmount != null) {
      next.lineTotalAmount = toNum(existing.lineTotalAmount) + toNum(item.lineTotalAmount)
    }
    if (item.refundTotalAmount != null || existing.refundTotalAmount != null) {
      next.refundTotalAmount = toNum(existing.refundTotalAmount) + toNum(item.refundTotalAmount)
    }
    if (!existing.imageUrl && item.imageUrl) next.imageUrl = item.imageUrl
    map.set(key, next)
  }
  return [...map.values()]
}

function commerceLineItemKey(item: Record<string, any>): string {
  const sellerSku = String(item.sellerSku || '').trim()
  if (sellerSku) return `sku:${sellerSku}`
  const externalSkuId = String(item.externalSkuId || '').trim()
  if (externalSkuId) return `ext:${externalSkuId}`
  const name = String(item.productNameSnapshot || item.skuNameSnapshot || '').trim()
  const price = item.saleUnitPrice ?? item.refundTotalAmount ?? ''
  if (name) return `name:${name}|${price}`
  return `id:${item.id || 'unknown'}`
}

function toNum(v: unknown): number {
  if (v == null || v === '') return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

export function formatCommerceTs(value?: string | null): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('id-ID')
  } catch {
    return value
  }
}

/** Format day keys from dashboard analytics (DATE / ISO) → short ID label. */
export function formatCommerceDay(value?: string | Date | null): string {
  if (value == null || value === '') return '—'
  try {
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } catch {
    return String(value)
  }
}

const SUCCESS = new Set([
  'ACTIVE',
  'ACTIVATE',
  'CONNECTED',
  'COMPLETED',
  'DELIVERED',
  'RELEASED',
  'MAPPED',
  'SUCCESS',
  'DONE',
])
const DANGER = new Set([
  'DISCONNECTED',
  'DELETED',
  'CANCELLED',
  'EXCEPTION',
  'FAILED',
  'PLATFORM_DEACTIVATED',
  'SELLER_DEACTIVATED',
  'TOKEN_EXPIRED',
  'MISSING_SCOPE',
  'REAUTH_REQUIRED',
  'RELEASE_BLOCKED',
  'API_ERROR',
  'CONFIG_MISSING',
  'DEAD',
])
const SECONDARY = new Set([
  'DRAFT',
  'PENDING',
  'FREEZE',
  'SCHEDULED',
  'NEVER_PROBED',
  'IMPORTED',
  'UNPAID',
  'ON_HOLD',
  'INACTIVE',
  'PROCESSING',
])

/** Unified badge class for shop / product / probe / order statuses (Vuexy bg-label-*). */
export function commerceStatusBadge(status?: string | null): string {
  const s = String(status || '').toUpperCase()
  if (!s) return 'bg-label-secondary'
  if (SUCCESS.has(s)) return 'bg-label-success'
  if (DANGER.has(s)) return 'bg-label-danger'
  if (SECONDARY.has(s)) return 'bg-label-secondary'
  return 'bg-label-warning'
}
