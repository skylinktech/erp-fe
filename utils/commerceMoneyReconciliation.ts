/**
 * Client-side mirror of erp_skl `marketplace_money_snapshot.ts#validateSnapshotForRelease`
 * header-consistency check: merchandise − sellerDiscount − platformDiscount + shipping + tax
 * should equal buyerPayment (totalAmount). Unknown components must stay "unknown", never 0.
 *
 * This only reproduces the header-math check that is already available from the
 * External Order list/detail payload (`subtotalAmount`, `sellerDiscountAmount`, …).
 * It does NOT replace a backend reconciliation endpoint for COGS/settlement — see
 * `commerceRevenueReconciliation` in `plugins/api.client.ts` for that (assumed path,
 * pending BE alignment).
 */

export type CommerceMoneyReconciliationResult = {
  ok: boolean
  status: 'MATCH' | 'MISMATCH' | 'INCOMPLETE'
  expectedTotal: number | null
  actualTotal: number | null
  difference: number | null
  missingFields: string[]
}

type MoneyLike = string | number | null | undefined

function toNullableNumber(value: MoneyLike): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

export function reconcileCommerceOrderMoney(order: {
  subtotalAmount?: MoneyLike
  sellerDiscountAmount?: MoneyLike
  platformDiscountAmount?: MoneyLike
  shippingFeeAmount?: MoneyLike
  taxAmount?: MoneyLike
  totalAmount?: MoneyLike
}): CommerceMoneyReconciliationResult {
  const merchandise = toNullableNumber(order.subtotalAmount)
  const sellerDiscount = toNullableNumber(order.sellerDiscountAmount)
  const platformDiscount = toNullableNumber(order.platformDiscountAmount)
  const shipping = toNullableNumber(order.shippingFeeAmount)
  const tax = toNullableNumber(order.taxAmount)
  const actualTotal = toNullableNumber(order.totalAmount)

  const missingFields: string[] = []
  if (merchandise == null) missingFields.push('subtotalAmount')
  if (sellerDiscount == null) missingFields.push('sellerDiscountAmount')
  if (platformDiscount == null) missingFields.push('platformDiscountAmount')
  if (shipping == null) missingFields.push('shippingFeeAmount')
  if (tax == null) missingFields.push('taxAmount')
  if (actualTotal == null) missingFields.push('totalAmount')

  if (missingFields.length > 0) {
    return {
      ok: false,
      status: 'INCOMPLETE',
      expectedTotal: null,
      actualTotal,
      difference: null,
      missingFields,
    }
  }

  const expectedTotal =
    Math.round(
      (merchandise! - sellerDiscount! - platformDiscount! + shipping! + tax!) * 100
    ) / 100
  const difference = Math.round((actualTotal! - expectedTotal) * 100) / 100
  const match = Math.abs(difference) < 1 // toleransi pembulatan kecil (< 1 unit mata uang)

  return {
    ok: match,
    status: match ? 'MATCH' : 'MISMATCH',
    expectedTotal,
    actualTotal,
    difference,
    missingFields: [],
  }
}
