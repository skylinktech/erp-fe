export type StockLineStatus = 'sufficient' | 'insufficient' | 'not_found' | 'skipped'

export interface StockAvailabilityLine {
  itemId: number | null
  productId: number | null
  productName: string
  productSku: string | null
  warehouseId: number | null
  warehouseName: string | null
  requestedQty: number
  /** Phase 18A: on-hand qty (stocks.quantity). Field name kept for BC. */
  availableQty: number
  onHandQty?: number
  availabilityMode?: 'ON_HAND_ONLY'
  status: StockLineStatus
  message: string | null
}

export interface StockAvailabilityResult {
  lines: StockAvailabilityLine[]
  allSufficient: boolean
  hasShortage: boolean
  hasStockableItems: boolean
  availabilityMode?: 'ON_HAND_ONLY'
}
