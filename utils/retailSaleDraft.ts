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
}) {
  const draft = input.status === 'DRAFT'
  const confirmed = input.status === 'CONFIRMED'
  const fulfilled = input.status === 'FULFILLED'
  return {
    canCreate: input.canCreate,
    canEdit: input.canCreate && draft,
    canConfirm: Boolean(input.canConfirm) && draft,
    canCancel: Boolean(input.canCancel) && (draft || confirmed),
    canFulfill: Boolean(input.canFulfill) && confirmed,
    canInvoice: Boolean(input.canInvoice) && fulfilled && input.financeState === 'NOT_INVOICED',
    canResumeSubmit: Boolean(input.canInvoice) && fulfilled && input.financeState === 'INVOICE_PENDING' && input.invoiceDocumentStatus === 'draft',
    canPay: Boolean(input.canPay) && fulfilled && input.financeState === 'INVOICED',
  }
}

export function retailTotalsFromServer(sale: { subtotal?: number; grandTotal?: number } | null | undefined) {
  return {
    subtotal: Number(sale?.subtotal ?? 0),
    grandTotal: Number(sale?.grandTotal ?? 0),
  }
}

export function retailConflictMessage(payload: { code?: string; message?: string; data?: { proposedGrandTotal?: number } } | null) {
  if (!payload?.code) return ''
  if (payload.code === 'RETAIL_PRICE_CHANGED') {
    return `${payload.message || 'Harga resmi berubah.'} Total baru ${payload.data?.proposedGrandTotal ?? ''}`
  }
  return payload.message || 'Permintaan Retail ditolak.'
}
