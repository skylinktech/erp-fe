export type StockLineStatus = 'sufficient' | 'insufficient' | 'not_found' | 'skipped'

export interface StockAvailabilityLine {
  itemId: number | null
  productId: number | null
  productName: string
  productSku: string | null
  warehouseId: number | null
  warehouseName: string | null
  requestedQty: number
  availableQty: number
  status: StockLineStatus
  message: string | null
}

export interface StockAvailabilityResult {
  lines: StockAvailabilityLine[]
  allSufficient: boolean
  hasShortage: boolean
  hasStockableItems: boolean
}
