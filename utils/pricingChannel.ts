/**
 * Pricing (product selling price) channels — mirrors backend
 * `src/app/domain/sales/pricing_channel.ts` (erp_skl).
 *
 * POS / B2B / MARKETPLACE are sales channels; PRODUCT_QUOTATION is the quotation
 * channel. Legacy RETAIL rows are normalized to POS for display + filtering —
 * do not introduce a separate "RETAIL" concept in new UI.
 */
export const PRICING_CHANNELS = {
  POS: 'POS',
  B2B: 'B2B',
  MARKETPLACE: 'MARKETPLACE',
  PRODUCT_QUOTATION: 'PRODUCT_QUOTATION',
} as const

export type PricingChannel = (typeof PRICING_CHANNELS)[keyof typeof PRICING_CHANNELS]

/** Raw values that may still arrive from the API (legacy rows). */
export type PricingChannelInput = PricingChannel | 'RETAIL'

export const PRICING_CHANNEL_VALUES: PricingChannel[] = [
  PRICING_CHANNELS.POS,
  PRICING_CHANNELS.B2B,
  PRICING_CHANNELS.MARKETPLACE,
  PRICING_CHANNELS.PRODUCT_QUOTATION,
]

export const PRICING_CHANNEL_LABELS: Record<PricingChannel, string> = {
  POS: 'POS / Direct Sale',
  B2B: 'B2B / Sales Order',
  MARKETPLACE: 'Marketplace',
  PRODUCT_QUOTATION: 'Product Quotation',
}

/** Select/tab options for forms + filters (legacy RETAIL intentionally excluded). */
export const PRICING_CHANNEL_OPTIONS: Array<{ value: PricingChannel; label: string }> =
  PRICING_CHANNEL_VALUES.map((value) => ({ value, label: PRICING_CHANNEL_LABELS[value] }))

/** Normalizes any raw channel value (including legacy RETAIL) to a display channel. */
export function normalizePricingChannel(value: string | null | undefined): PricingChannel | null {
  if (!value) return null
  if (value === 'RETAIL' || value === PRICING_CHANNELS.POS) return PRICING_CHANNELS.POS
  if ((PRICING_CHANNEL_VALUES as string[]).includes(value)) {
    return value as PricingChannel
  }
  return null
}

export function pricingChannelLabel(value: string | null | undefined): string {
  const normalized = normalizePricingChannel(value)
  return normalized ? PRICING_CHANNEL_LABELS[normalized] : value || '—'
}
