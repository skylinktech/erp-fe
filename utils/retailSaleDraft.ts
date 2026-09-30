import { humanizeLabel } from '~/utils/humanizeLabel'
export function retailDraftActions(input: {
  status?: string | null
  canCreate: boolean
  canConfirm?: boolean
  canCancel?: boolean
  canFulfill?: boolean
  canInvoice?: boolean
  canPay?: boolean
  financeState?: string | null
  invoiceDocumentStatus?: string | null
  /** Backend eligibility — when present, gates canInvoice together with permission. */
  invoiceEligibility?: {
    canInvoice?: boolean
    blockerCodes?: string[]
    messages?: string[]
    existingInvoiceId?: string | null
  } | null
}) {
  const draft = input.status === 'DRAFT'
  const confirmed = input.status === 'CONFIRMED'
  const fulfilled = input.status === 'FULFILLED'
  const eligibility = input.invoiceEligibility
  const eligibilityAllows =
    eligibility == null
      ? true
      : Boolean(eligibility.canInvoice) ||
        (Boolean(eligibility.existingInvoiceId) && input.financeState === 'INVOICE_PENDING')
  const permissionInvoice = Boolean(input.canInvoice)
  return {
    canCreate: input.canCreate,
    canEdit: input.canCreate && draft,
    canConfirm: Boolean(input.canConfirm) && draft,
    canCancel: Boolean(input.canCancel) && (draft || confirmed),
    canFulfill: Boolean(input.canFulfill) && confirmed,
    canInvoice:
      permissionInvoice &&
      fulfilled &&
      input.financeState === 'NOT_INVOICED' &&
      (eligibility == null || Boolean(eligibility.canInvoice)),
    canResumeSubmit:
      permissionInvoice &&
      fulfilled &&
      input.financeState === 'INVOICE_PENDING' &&
      input.invoiceDocumentStatus === 'draft' &&
      eligibilityAllows,
    canPay: Boolean(input.canPay) && fulfilled && input.financeState === 'INVOICED',
    invoiceBlockers: eligibility?.messages || [],
    invoiceBlockerCodes: eligibility?.blockerCodes || [],
    existingInvoiceId: eligibility?.existingInvoiceId || null}
}

export function retailTotalsFromServer(sale: { subtotal?: number; grandTotal?: number } | null | undefined) {
  return {
    subtotal: Number(sale?.subtotal ?? 0),
    grandTotal: Number(sale?.grandTotal ?? 0)}
}

export function retailConflictMessage(payload: { code?: string; message?: string; data?: { proposedGrandTotal?: number } } | null) {
  if (!payload?.code) return ''
  if (payload.code === 'RETAIL_PRICE_CHANGED') {
    return `${payload.message || 'Harga resmi berubah.'} Total baru ${payload.data?.proposedGrandTotal ?? ''}`
  }
  return payload.message || 'Permintaan Retail ditolak.'
}

export const RETAIL_SALE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const

export const RETAIL_CUSTOMER_MODE_OPTIONS = [
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'REGISTERED', label: 'Terdaftar' },
] as const

export function retailSaleStatusBadge(status?: string | null) {
  const key = String(status || '').toUpperCase()
  const map: Record<string, { class: string; text: string }> = {
    DRAFT: { class: 'badge bg-label-secondary', text: 'Draft' },
    CONFIRMED: { class: 'badge bg-label-info', text: 'Confirmed' },
    FULFILLED: { class: 'badge bg-label-success', text: 'Fulfilled' },
    CANCELLED: { class: 'badge bg-label-danger', text: 'Cancelled' }}
  return map[key] || { class: 'badge bg-label-secondary', text: humanizeLabel(status, { fallback: '—' }) }
}

export function retailFinanceStateBadge(state?: string | null) {
  const key = String(state || 'NOT_INVOICED').toUpperCase()
  const map: Record<string, { class: string; text: string }> = {
    NOT_INVOICED: { class: 'badge bg-label-secondary', text: 'Belum invoice' },
    INVOICE_PENDING: { class: 'badge bg-label-warning', text: 'Invoice pending' },
    INVOICED: { class: 'badge bg-label-info', text: 'Invoiced' },
    PAYMENT_PENDING: { class: 'badge bg-label-warning', text: 'Bayar pending' },
    PAID: { class: 'badge bg-label-success', text: 'Lunas' }}
  return map[key] || { class: 'badge bg-label-secondary', text: humanizeLabel(state, { fallback: '—' }) }
}

export function retailCustomerModeLabel(mode?: string | null) {
  if (mode === 'REGISTERED') return 'Terdaftar'
  if (mode === 'WALK_IN') return 'Walk-in'
  return humanizeLabel(mode, { fallback: '—' })
}

export function formatRetailMoney(
  amount: string | number | null | undefined,
  currency = 'IDR'
) {
  if (amount == null || amount === '') return '—'
  const n = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(n)) return `${currency} ${amount}`
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      maximumFractionDigits: 0}).format(n)
  } catch {
    return `${currency} ${n}`
  }
}

export function formatRetailDateTime(value?: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'})
  } catch {
    return value
  }
}

/** Mirrors backend isMarketplaceRetailChannel — no invented email for marketplace. */
export function isMarketplaceRetailSale(sale: {
  moneySource?: string | null
  commerceExternalOrderId?: string | null
} | null | undefined) {
  if (!sale) return false
  if (String(sale.moneySource || '') === 'MARKETPLACE_SNAPSHOT') return true
  return Boolean(sale.commerceExternalOrderId)
}
