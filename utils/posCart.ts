export type PosCartLine = {
  productId: number
  unitId: number
  quantity: number
  productName: string
  sku: string
  unitName: string
  officialUnitPrice: number
  priceListCode?: string | null
}

export type PosCatalogRow = {
  productId: number
  sku: string
  name: string
  image: string | null
  unitId: number
  unitName: string | null
  unitSymbol: string | null
  categoryId: number | null
  categoryName: string | null
  isBundling?: boolean
  isKit?: boolean
  availableQty: number | null
  onHandQty: number | null
  reservedQty: number | null
  officialUnitPrice: number | null
  priceListCode: string | null
  currency: string | null
}

/** Merge same product+UOM; quantity must stay positive. */
export function upsertPosCartLine(cart: PosCartLine[], line: PosCartLine): PosCartLine[] {
  const qty = Number(line.quantity)
  if (!(qty > 0) || !Number.isFinite(qty)) return cart.slice()
  const next = cart.map((row) => ({ ...row }))
  const idx = next.findIndex((row) => row.productId === line.productId && row.unitId === line.unitId)
  if (idx >= 0) {
    next[idx] = { ...next[idx], quantity: Number(next[idx].quantity) + qty }
    return next
  }
  next.push({ ...line, quantity: qty })
  return next
}

export function updatePosCartQuantity(cart: PosCartLine[], index: number, quantity: number): PosCartLine[] {
  const next = cart.map((row) => ({ ...row }))
  if (index < 0 || index >= next.length) return next
  const qty = Number(quantity)
  if (!(qty > 0) || !Number.isFinite(qty)) {
    next.splice(index, 1)
    return next
  }
  next[index] = { ...next[index], quantity: qty }
  return next
}

export function removePosCartLine(cart: PosCartLine[], index: number): PosCartLine[] {
  return cart.filter((_, i) => i !== index)
}

export function posCartIndicativeSubtotal(cart: PosCartLine[]): number {
  return cart.reduce((sum, row) => sum + Number(row.quantity) * Number(row.officialUnitPrice), 0)
}

export function formatPosMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function formatPosAvailableStock(availableQty: number | null | undefined): {
  label: string
  tone: 'unknown' | 'zero' | 'ok'
} {
  if (availableQty == null || Number.isNaN(Number(availableQty))) {
    return { label: 'Stok tidak diketahui', tone: 'unknown' }
  }
  const n = Number(availableQty)
  if (n <= 0) return { label: 'Stok: 0', tone: 'zero' }
  return { label: `Stok: ${n}`, tone: 'ok' }
}

export function formatPosOfficialPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(Number(price))) return 'Harga belum tersedia'
  return formatPosMoney(price)
}

/**
 * Keep one idempotency key for a cart fingerprint until success or cart/context change.
 * Retry after timeout reuses the same key to avoid duplicate checkout.
 */
export function posCheckoutFingerprint(input: {
  companyId: number
  warehouseId: number
  customerMode: string
  customerId: number | null
  walkInName: string
  items: Array<{ productId: number; unitId: number; quantity: number }>
}): string {
  const items = input.items
    .map((i) => `${i.productId}:${i.unitId}:${i.quantity}`)
    .sort()
    .join('|')
  return [
    input.companyId,
    input.warehouseId,
    input.customerMode,
    input.customerId ?? '',
    input.walkInName.trim(),
    items,
  ].join('::')
}

export function shouldIgnoreStaleCatalog(
  requestGeneration: number,
  currentGeneration: number,
  requestSearch: string,
  currentSearch: string,
  requestWarehouseId: number | null,
  currentWarehouseId: number | null,
  requestCompanyId?: number | null,
  currentCompanyId?: number | null
): boolean {
  if (
    requestCompanyId != null &&
    currentCompanyId != null &&
    Number(requestCompanyId) !== Number(currentCompanyId)
  ) {
    return true
  }
  return (
    requestGeneration !== currentGeneration ||
    requestSearch !== currentSearch ||
    requestWarehouseId !== currentWarehouseId
  )
}
