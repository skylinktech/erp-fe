/**
 * Page-scoped bulk selection for Omnichannel orders (Desty-style).
 * Pure helpers — no fetch. Eligibility comes from backend `actions.arrangeShipment`.
 */

export const COMMERCE_BULK_ARRANGE_MAX = 50

type BulkSelectableOrder = {
  id?: string | number | null
  actions?: {
    arrangeShipment?: { enabled?: boolean; reason?: string | null } | null
  } | null
}

export function isCommerceOrderBulkSelectable(order: BulkSelectableOrder | null | undefined): boolean {
  return Boolean(order?.actions?.arrangeShipment?.enabled)
}

export function commerceBulkSelectReason(order: BulkSelectableOrder | null | undefined): string {
  return (
    order?.actions?.arrangeShipment?.reason ||
    'Atur pengiriman belum tersedia untuk pesanan ini.'
  )
}

/** Eligible order ids on the current page, capped for bulk API. */
export function listBulkSelectableOrderIds(
  orders: BulkSelectableOrder[] | null | undefined,
  max = COMMERCE_BULK_ARRANGE_MAX
): string[] {
  const limit = Math.max(1, Math.min(COMMERCE_BULK_ARRANGE_MAX, Number(max) || COMMERCE_BULK_ARRANGE_MAX))
  const ids: string[] = []
  for (const order of orders || []) {
    if (!isCommerceOrderBulkSelectable(order)) continue
    const id = order?.id
    if (id == null || id === '') continue
    ids.push(String(id))
    if (ids.length >= limit) break
  }
  return ids
}

export type CommercePageBulkSelectState = {
  eligibleIds: string[]
  eligibleCount: number
  selectedEligibleCount: number
  allEligibleSelected: boolean
  someEligibleSelected: boolean
  indeterminate: boolean
  noneEligible: boolean
}

export function resolvePageBulkSelectState(input: {
  orders: BulkSelectableOrder[] | null | undefined
  selectedIds: string[] | null | undefined
  max?: number
}): CommercePageBulkSelectState {
  const eligibleIds = listBulkSelectableOrderIds(input.orders, input.max)
  const selected = new Set((input.selectedIds || []).map(String))
  const selectedEligibleCount = eligibleIds.reduce(
    (n, id) => n + (selected.has(id) ? 1 : 0),
    0
  )
  const allEligibleSelected = eligibleIds.length > 0 && selectedEligibleCount === eligibleIds.length
  const someEligibleSelected = selectedEligibleCount > 0
  return {
    eligibleIds,
    eligibleCount: eligibleIds.length,
    selectedEligibleCount,
    allEligibleSelected,
    someEligibleSelected,
    indeterminate: someEligibleSelected && !allEligibleSelected,
    noneEligible: eligibleIds.length === 0,
  }
}

/**
 * Toggle "Pilih semua" for the current page.
 * Replaces selection with page-eligible ids (or clears). Off-page ids are dropped — page changes should reset anyway.
 */
export function toggleSelectAllOnPage(input: {
  orders: BulkSelectableOrder[] | null | undefined
  selectAll: boolean
  max?: number
}): string[] {
  if (!input.selectAll) return []
  return listBulkSelectableOrderIds(input.orders, input.max)
}

export function toggleOrderSelection(input: {
  selectedIds: string[] | null | undefined
  orderId: string
  selected: boolean
  max?: number
}): string[] {
  const max = Math.max(1, Math.min(COMMERCE_BULK_ARRANGE_MAX, Number(input.max) || COMMERCE_BULK_ARRANGE_MAX))
  const next = new Set((input.selectedIds || []).map(String))
  if (input.selected) {
    if (next.size >= max && !next.has(input.orderId)) return [...next]
    next.add(String(input.orderId))
  } else {
    next.delete(String(input.orderId))
  }
  return [...next]
}
