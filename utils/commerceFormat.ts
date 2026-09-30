/** Shared formatters / status badges for commerce Omnichannel UI (pure, reusable). */

import { humanizeLabel } from '~/utils/humanizeLabel'

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
      maximumFractionDigits: 0}).format(n)
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
      map.set(key, { ...item, quantity: toNum(item.quantity) } as T)
      continue
    }
    const qty = toNum(existing.quantity) + toNum(item.quantity)
    const next = { ...existing, quantity: qty } as T & {
      lineTotalAmount?: number
      refundTotalAmount?: number
      imageUrl?: string
    }
    if (item.lineTotalAmount != null || existing.lineTotalAmount != null) {
      next.lineTotalAmount = toNum(existing.lineTotalAmount) + toNum(item.lineTotalAmount)
    }
    if (item.refundTotalAmount != null || existing.refundTotalAmount != null) {
      next.refundTotalAmount = toNum(existing.refundTotalAmount) + toNum(item.refundTotalAmount)
    }
    if (!existing.imageUrl && item.imageUrl) next.imageUrl = item.imageUrl
    map.set(key, next as T)
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
  'CONNECTED',
  'SUCCESS',
  'DONE',
  'PUBLISHED',
  'VALIDATED',
  'READY',
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
  'AMBIGUOUS',
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
  'UNMAPPED',
  'INCOMPLETE',
  'PROCESSING',
  'PUBLISHING',
  'UPDATE_PENDING',
  'REVIEWING',
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

/**
 * Known commerce enum → readable label (KISS overrides).
 * Unknown codes fall through to humanizeLabel (AR Receipt-style Title Case).
 */
const COMMERCE_ENUM_LABELS: Record<string, string> = {
  // processing / ops
  IMPORTED: 'Imported',
  MAPPED: 'Terhubung',
  UNMAPPED: 'Belum terhubung',
  PROBLEM: 'Bermasalah',
  CONNECTED: 'Terhubung',
  INCOMPLETE: 'Belum lengkap',
  INACTIVE: 'Tidak aktif',
  EXCEPTION: 'Exception',
  RELEASE_BLOCKED: 'Release Blocked',
  AWAITING_FULFILLMENT: 'Menunggu Fulfillment',
  IN_FULFILLMENT: 'Dalam Fulfillment',
  SHIPPED: 'Shipped',
  STOCK_ISSUED: 'Stock Issued',
  CANCELLED_OPS: 'Cancelled Ops',
  SHIP_ARRANGED: 'Ship Arranged',
  LABEL_READY: 'Label Ready',
  HANDED_OVER: 'Handed Over',
  RESERVED: 'Reserved',
  PICKED: 'Picked',
  PACKED: 'Packed',
  NONE: 'None',
  // fulfillment types
  FULFILLMENT_BY_SELLER: 'Fulfillment by Seller',
  FULFILLMENT_BY_PLATFORM: 'Fulfillment by Platform',
  SEND_BY_SELLER: 'Send by Seller',
  // returns / cases
  REFUND: 'Refund',
  RETURN: 'Return',
  REPLACEMENT: 'Replacement',
  CANCEL: 'Cancel',
  // sync / publish
  LIVE_HOLD: 'Live Hold',
  CREATE: 'Create',
  UPDATE: 'Update',
  FULL: 'Full',
  PARTIAL: 'Partial',
  CONTENT: 'Content',
  PRICE: 'Price',
  INVENTORY: 'Inventory',
  // reconciliation / batch
  SUCCESS: 'Success',
  FAILED: 'Failed',
  AMBIGUOUS: 'Ambiguous',
  SKIPPED: 'Skipped',
  MATCH: 'Match',
  MISMATCH: 'Mismatch',
  // weight
  KILOGRAM: 'Kilogram',
  GRAM: 'Gram',
  // worker
  POLL: 'Poll',
  PUSH: 'Push',
  IDLE: 'Idle',
  NEVER_PROBED: 'Belum dicek',
}

/** Human-readable commerce status / enum for any UI text (badge, cell, filter, hint). */
export function commerceStatusLabel(status?: string | null, fallback = '—'): string {
  return humanizeLabel(status, { labels: COMMERCE_ENUM_LABELS, fallback })
}

/** Alias — prefer for non-status enums (fulfillmentType, caseType, commandType, …). */
export function commerceEnumLabel(value?: string | null, fallback = '—'): string {
  return commerceStatusLabel(value, fallback)
}
