export interface QuotationTotals {
  productSubtotal: number
  serviceSubtotal: number
  didSubtotal: number
  subtotal: number
  discountPercent: number
  discountAmount: number
  afterDiscount: number
  ppnPercent: number
  ppnAmount: number
  hasPph: boolean
  pphPercent: number
  pphAmount: number
  grandTotal: number
}

export function fromQuotationApiNum(q: Record<string, unknown> | null | undefined, ...keys: string[]): number {
  if (!q) return 0
  for (const key of keys) {
    const value = q[key]
    if (value !== undefined && value !== null && value !== '') {
      const num = Number(value)
      if (!Number.isNaN(num)) return num
    }
  }
  return 0
}

/** Hitung ringkasan finansial quotation dari nilai API (selaras backend). */
export function computeQuotationTotals(q: Record<string, unknown> | null | undefined): QuotationTotals {
  const productSubtotal = fromQuotationApiNum(q, 'productSubtotal', 'product_subtotal')
  const serviceSubtotal = fromQuotationApiNum(q, 'serviceSubtotal', 'service_subtotal')
  const didSubtotal = fromQuotationApiNum(q, 'didSubtotal', 'did_subtotal')
  const subtotal = productSubtotal + serviceSubtotal + didSubtotal

  const discountPercent = Number(q?.discountPercent ?? q?.discount_percent) || 0
  const ppnPercent = Number(q?.taxPercent ?? q?.tax_percent) || 0
  const hasPph = !!(q?.hasPph ?? q?.has_pph)
  const pphPercent = hasPph ? (Number(q?.pphPercent ?? q?.pph_percent) || 0) : 0

  const discountAmount = subtotal * (discountPercent / 100)
  const afterDiscount = subtotal - discountAmount
  const ppnAmount = afterDiscount * (ppnPercent / 100)
  const pphAmount = afterDiscount * (pphPercent / 100)

  const grandTotalFromApi = fromQuotationApiNum(q, 'grandTotal', 'grand_total')
  const grandTotal = grandTotalFromApi > 0
    ? grandTotalFromApi
    : afterDiscount + ppnAmount - pphAmount

  return {
    productSubtotal,
    serviceSubtotal,
    didSubtotal,
    subtotal,
    discountPercent,
    discountAmount,
    afterDiscount,
    ppnPercent,
    ppnAmount,
    hasPph,
    pphPercent,
    pphAmount,
    grandTotal,
  }
}
