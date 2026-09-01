/**
 * Shared commercial money helpers for Quotation / SI UX.
 * Mirrors backend `#domain/commercial` — authoritative recompute still happens on API write.
 */

import { calculateContractAmount, calculatePeriodAmount } from '~/utils/siFeasibilityPreview'

export { calculateContractAmount, calculatePeriodAmount }

/**
 * Quotation service line Subtotal = SI Contract economics
 * (recurring MONTH: qty × unitPrice × durationMonths; one-time: qty × unitPrice).
 */
export function serviceContractSubtotal(item: {
  quantity?: number | null
  price?: number | null
  contractDurationMonths?: number | null
  pricingPeriod?: string | null
  billingType?: string | null
  service?: { billingType?: string | null } | null
} | null | undefined): number {
  if (!item) return 0
  const billingType = item.billingType ?? item.service?.billingType ?? null
  const pricingPeriodRaw = item.pricingPeriod
  const isOneTime =
    billingType === 'one_time' ||
    pricingPeriodRaw === 'ONE_TIME' ||
    pricingPeriodRaw === 'one_time'

  return calculateContractAmount({
    quantity: item.quantity,
    unitPrice: item.price,
    contractDurationMonths: item.contractDurationMonths,
    chargeKind: isOneTime ? 'ONE_TIME' : 'RECURRING',
    pricingPeriod: isOneTime ? 'ONE_TIME' : pricingPeriodRaw || 'MONTH',
  })
}
