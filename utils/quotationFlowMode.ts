export type QuotationFlowOffer = {
  code: string
  flowVersionId: number
  siteInvestmentApplicability: 'REQUIRED' | 'NOT_APPLICABLE'
  pricingMode: string
  downstream: string
  companies: Array<{ id: number; name: string }>
}

export function productOffer(flows: QuotationFlowOffer[] | null | undefined) {
  return (flows || []).find(
    (flow) =>
      flow.code === 'PRODUCT_QUOTATION' &&
      flow.pricingMode === 'QUOTATION_PRODUCT_LINES' &&
      flow.siteInvestmentApplicability === 'NOT_APPLICABLE' &&
      flow.downstream === 'NOT_SUPPORTED' &&
      flow.companies.length > 0
  ) || null
}

export function quotationSavePlan(input: {
  flowCode?: string | null
  status?: string | null
  siteInvestId?: string | null
  siteId?: number | string | null
  businessCaseId?: string | null
  customerId?: number | string | null
  hasProductLine: boolean
}) {
  if (input.flowCode === 'RETAIL_DIRECT_SALE') {
    return {
      mode: 'unsupported' as const,
      errors: ['Retail sale belum tersedia. Quotation, Sales Order, dan POS tidak dipakai.'],
    }
  }
  const product = input.flowCode === 'PRODUCT_QUOTATION'
  if (String(input.status || '').toLowerCase() === 'approved') {
    return { mode: product ? 'product' : 'isp', errors: ['Quotation approved tidak dapat diubah.'] }
  }
  if (!product) {
    const errors: string[] = []
    if (!input.siteInvestId) errors.push('Site Investment harus dipilih')
    if (!input.siteId) errors.push('Site harus dipilih')
    if (!input.customerId) errors.push('Customer harus dipilih')
    return { mode: 'isp' as const, errors }
  }
  const errors: string[] = []
  if (!input.businessCaseId) errors.push('Business Case wajib untuk Product Quotation.')
  if (!input.customerId) errors.push('Customer harus dipilih')
  if (input.siteInvestId || input.siteId) errors.push('Site Investment dan Site tidak berlaku untuk Product Quotation.')
  if (!input.hasProductLine) errors.push('Minimal harus ada 1 item produk.')
  return { mode: 'product' as const, errors }
}

export function productDownstreamHidden(flowCode?: string | null, siteInvestId?: string | null) {
  return flowCode === 'PRODUCT_QUOTATION' || !siteInvestId
}

export function productPriceLocked(flowCode?: string | null) {
  return flowCode === 'PRODUCT_QUOTATION'
}

export function productDocumentOffer(input: {
  status?: string | null
  lines?: Array<{ productNameSnapshot?: string | null }>
}) {
  const product = (input.lines || []).some((line) => Boolean(line.productNameSnapshot))
  if (!product) return null
  const status = String(input.status || '').toLowerCase()
  const label = status === 'approved'
    ? 'Unduh PDF'
    : status === 'rejected'
      ? 'PDF ditolak'
      : status === 'expired'
        ? 'PDF kadaluarsa'
        : 'Pratinjau PDF'
  return { endpoint: 'product-document', label, status }
}

export function quotationLineName(line: {
  productNameSnapshot?: string | null
  product?: { name?: string | null; sku?: string | null } | null
}) {
  return line.productNameSnapshot || line.product?.name || line.product?.sku || '—'
}
