import type { StockAvailabilityLine, StockAvailabilityResult } from '~/types/purchasing/stock-availability'

export function shortageLines(result: StockAvailabilityResult | null | undefined): StockAvailabilityLine[] {
  if (!result?.lines?.length) return []
  return result.lines.filter((l) => l.status === 'insufficient' || l.status === 'not_found')
}

export function sufficientLines(result: StockAvailabilityResult | null | undefined): StockAvailabilityLine[] {
  if (!result?.lines?.length) return []
  return result.lines.filter((l) => l.status === 'sufficient')
}

export function stockAvailabilitySummary(result: StockAvailabilityResult | null | undefined): string {
  if (!result?.hasStockableItems) {
    return 'Tidak ada item produk dengan gudang untuk dicek stok.'
  }
  if (result.allSufficient) {
    return 'Semua stok produk yang diminta sudah mencukupi.'
  }
  const short = shortageLines(result).length
  return `${short} item memiliki stok kosong atau tidak mencukupi. Buat Purchase Order untuk pengadaan.`
}

export function getAvailableQty(
  stockMap: Map<string, number>,
  productId: number | null | undefined,
  warehouseId: number | null | undefined
): number {
  if (!productId || !warehouseId) return 0
  return stockMap.get(`${productId}:${warehouseId}`) ?? 0
}

export function evaluateLineStock(
  requestedQty: number,
  availableQty: number
): 'sufficient' | 'insufficient' | 'not_found' {
  if (availableQty <= 0) return 'not_found'
  if (availableQty < requestedQty) return 'insufficient'
  return 'sufficient'
}

export function buildStockMap(
  stocks: Array<{ productId?: number; product_id?: number; warehouseId?: number; warehouse_id?: number; quantity?: number }>
): Map<string, number> {
  const map = new Map<string, number>()
  for (const s of stocks) {
    const pid = s.productId ?? s.product_id
    const wid = s.warehouseId ?? s.warehouse_id
    if (pid && wid) map.set(`${pid}:${wid}`, Number(s.quantity) || 0)
  }
  return map
}

export interface FormStockItemInput {
  productType?: string
  productId?: number | null
  warehouseId?: number | null
  qty?: number
  productName?: string
}

/** Evaluasi stok dari isian form PR (client-side, tanpa simpan ke server). */
export function evaluateFormItemsStock(
  items: FormStockItemInput[],
  defaultWarehouseId: number | null | undefined,
  stockMap: Map<string, number>,
  products: Array<{ id: number; sku?: string; name?: string }> = [],
  warehouses: Array<{ id: number; name?: string; code?: string }> = []
): StockAvailabilityResult {
  type LineStatus = StockAvailabilityLine['status']
  const lines: StockAvailabilityLine[] = []

  const stockItems = items.filter((i) => (i.productType ?? 'product') === 'product' && i.productId)
  if (!stockItems.length) {
    return { lines, allSufficient: true, hasShortage: false, hasStockableItems: false }
  }

  const qtyByKey = new Map<string, { qty: number; item: FormStockItemInput }>()
  for (const d of stockItems) {
    const warehouseId = d.warehouseId ?? defaultWarehouseId ?? null
    if (!warehouseId) {
      const product = products.find((p) => Number(p.id) === Number(d.productId))
      lines.push({
        itemId: null,
        productId: d.productId ?? null,
        productName: d.productName || product?.name || 'Produk',
        productSku: product?.sku ?? null,
        warehouseId: null,
        warehouseName: null,
        requestedQty: Number(d.qty) || 0,
        availableQty: 0,
        status: 'skipped',
        message: 'Gudang belum ditentukan',
      })
      continue
    }
    const key = `${d.productId}:${warehouseId}`
    const prev = qtyByKey.get(key)
    if (prev) prev.qty += Number(d.qty) || 0
    else qtyByKey.set(key, { qty: Number(d.qty) || 0, item: d })
  }

  for (const [key, { qty: needQty, item }] of qtyByKey) {
    const [pidStr, widStr] = key.split(':')
    const productId = Number(pidStr)
    const warehouseId = Number(widStr)
    const product = products.find((p) => Number(p.id) === productId)
    const warehouse = warehouses.find((w) => Number(w.id) === warehouseId)
    const available = getAvailableQty(stockMap, productId, warehouseId)
    const productName = item.productName || product?.name || 'Produk'
    const status: LineStatus = evaluateLineStock(needQty, available)

    lines.push({
      itemId: null,
      productId,
      productName,
      productSku: product?.sku ?? null,
      warehouseId,
      warehouseName: warehouse ? `${warehouse.name || ''}${warehouse.code ? ` (${warehouse.code})` : ''}` : null,
      requestedQty: needQty,
      availableQty: available,
      status,
      message:
        status === 'sufficient'
          ? null
          : status === 'not_found'
            ? 'Stok kosong atau tidak ditemukan'
            : `Stok tidak mencukupi (tersedia ${Math.floor(available)}, diminta ${Math.floor(needQty)})`,
    })
  }

  const hasShortage = lines.some(
    (l) =>
      l.status === 'insufficient' ||
      l.status === 'not_found' ||
      (l.status === 'skipped' && !!l.productId)
  )
  const stockChecked = lines.filter((l) => l.status !== 'skipped')
  const allSufficient = stockChecked.length > 0 && stockChecked.every((l) => l.status === 'sufficient')

  return {
    lines,
    allSufficient,
    hasShortage,
    hasStockableItems: stockChecked.length > 0 || lines.some((l) => l.status === 'skipped' && l.productId),
  }
}

export type LineStockInfoStatus = 'sufficient' | 'insufficient' | 'not_found' | 'pending'

export interface LineStockInfo {
  status: LineStockInfoStatus
  availableQty: number
  requestedQty: number
  shortfall: number
  warehouseName?: string | null
}

/** Info stok satu baris item form (per baris, tanpa agregasi). */
export function getStockInfoForLine(
  stockMap: Map<string, number>,
  productId: number | null | undefined,
  warehouseId: number | null | undefined,
  requestedQty: number,
  warehouseName?: string | null
): LineStockInfo {
  const requested = Number(requestedQty) || 0
  if (!productId || !warehouseId) {
    return {
      status: 'pending',
      availableQty: 0,
      requestedQty: requested,
      shortfall: 0,
      warehouseName: warehouseName ?? null,
    }
  }
  const available = getAvailableQty(stockMap, productId, warehouseId)
  const status = evaluateLineStock(requested, available)
  const shortfall = status === 'sufficient' ? 0 : Math.max(0, requested - available)
  return {
    status,
    availableQty: available,
    requestedQty: requested,
    shortfall,
    warehouseName: warehouseName ?? null,
  }
}

export function lineStockHint(
  stockMap: Map<string, number>,
  productId: number | null | undefined,
  warehouseId: number | null | undefined,
  requestedQty: number
): { text: string; class: string; icon: string } {
  if (!productId || !warehouseId) return { text: '', class: '', icon: '' }
  const available = getAvailableQty(stockMap, productId, warehouseId)
  const requested = Number(requestedQty) || 0
  const status = evaluateLineStock(requested, available)
  if (status === 'sufficient') {
    return {
      text: `Stok tersedia: ${Math.floor(available)} (diminta ${Math.floor(requested)})`,
      class: 'text-success',
      icon: 'ri-checkbox-circle-line',
    }
  }
  if (status === 'insufficient') {
    return {
      text: `Stok tidak mencukupi — tersedia ${Math.floor(available)}, diminta ${Math.floor(requested)}`,
      class: 'text-warning',
      icon: 'ri-alert-line',
    }
  }
  return { text: 'Stok kosong di gudang ini', class: 'text-danger', icon: 'ri-error-warning-line' }
}

export function stockLineBadgeClass(status: StockAvailabilityLine['status']): string {
  switch (status) {
    case 'sufficient':
      return 'bg-label-success'
    case 'insufficient':
      return 'bg-label-warning'
    case 'not_found':
      return 'bg-label-danger'
    default:
      return 'bg-label-secondary'
  }
}

export function stockLineBadgeText(line: StockAvailabilityLine): string {
  return stockLineBadgeLabel(line.status)
}

/** Label singkat untuk badge/tabel: Mencukupi / Tidak mencukupi */
export function stockLineBadgeLabel(
  status: StockAvailabilityLine['status'] | LineStockInfoStatus
): string {
  switch (status) {
    case 'sufficient':
      return 'Mencukupi'
    case 'insufficient':
    case 'not_found':
      return 'Tidak mencukupi'
    case 'pending':
      return 'Belum dicek'
    default:
      return '—'
  }
}

/** Ringkasan stok satu PR (untuk kolom tabel list). */
export function stockSummaryLabel(
  result: StockAvailabilityResult | null | undefined,
  options?: { loading?: boolean; error?: string | null }
): { label: string; badgeClass: string; title?: string; useBadge: boolean } {
  if (options?.loading) {
    return { label: 'Memuat…', badgeClass: 'bg-label-secondary', useBadge: true }
  }
  if (options?.error) {
    return {
      label: 'Tidak mencukupi',
      badgeClass: 'bg-label-danger',
      title: options.error,
      useBadge: true,
    }
  }
  if (!result) {
    return { label: '—', badgeClass: 'bg-label-secondary', useBadge: false }
  }

  const skippedNeedWarehouse = (result.lines ?? []).some(
    (l) => l.status === 'skipped' && l.productId
  )

  if (result.hasShortage || skippedNeedWarehouse) {
    const short = shortageLines(result).length + (skippedNeedWarehouse ? 1 : 0)
    return {
      label: 'Tidak mencukupi',
      badgeClass: 'bg-label-danger',
      title:
        short > 0
          ? `${short} item stok kosong, kurang, atau belum ada gudang`
          : 'Stok tidak mencukupi',
      useBadge: true,
    }
  }

  if (result.allSufficient && result.hasStockableItems) {
    return { label: 'Mencukupi', badgeClass: 'bg-label-success', useBadge: true }
  }

  if (!result.hasStockableItems) {
    return {
      label: '—',
      badgeClass: 'bg-label-secondary',
      title: 'Tidak ada item produk untuk dicek stok',
      useBadge: false,
    }
  }

  return { label: '—', badgeClass: 'bg-label-secondary', useBadge: false }
}
