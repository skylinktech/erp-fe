/** Input tanggal untuk `<input type="date">` (YYYY-MM-DD). */
export function financeInvoiceDateInput(value?: string | Date | null): string {
  if (!value) return ''
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return ''
    return trimmed.slice(0, 10)
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function financeInvoiceTodayDateInput(): string {
  return new Date().toISOString().slice(0, 10)
}

export type FinanceInvoicePaymentStatusForm = {
  status: 'unpaid' | 'partial' | 'paid' | string
  paidAt?: string
}

/** Sinkronkan paidAt saat user mengubah status pembayaran. */
export function applyFinanceInvoicePaymentStatusChange(form: FinanceInvoicePaymentStatusForm): void {
  if (form.status === 'paid') {
    if (!form.paidAt) {
      form.paidAt = financeInvoiceTodayDateInput()
    }
    return
  }
  form.paidAt = ''
}

export function validateFinanceInvoicePaymentStatus(
  form: FinanceInvoicePaymentStatusForm
): string | null {
  if (form.status === 'paid' && !form.paidAt) {
    return 'Tanggal pembayaran wajib diisi untuk status Paid'
  }
  return null
}
