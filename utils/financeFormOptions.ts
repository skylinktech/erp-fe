/** Normalized option shapes for finance form dropdowns (AR Receipt, AP Payment, etc.). */

export type ArReceiptInvoiceOption = {
  id: string
  noInvoice: string
  total: number
  remainingAmount: number
  paidAmount: number
  status: string
  currency: string
  documentSource?: string | null
}

export type BankAccountOption = {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  currency: string
}

export type ArReceiptFormOptionsPayload = {
  invoices: ArReceiptInvoiceOption[]
  bankAccounts: BankAccountOption[]
}

export function normalizeArReceiptInvoiceOption(raw: Record<string, unknown>): ArReceiptInvoiceOption {
  const total = Number(raw.total ?? raw.total_amount ?? 0)
  const remainingRaw = raw.remainingAmount ?? raw.remaining_amount
  const remainingAmount =
    remainingRaw !== null && remainingRaw !== undefined ? Number(remainingRaw) : total

  return {
    id: String(raw.id ?? ''),
    noInvoice: String(raw.noInvoice ?? raw.no_invoice ?? raw.reference_number ?? ''),
    total,
    remainingAmount,
    paidAmount: Number(raw.paidAmount ?? raw.paid_amount ?? 0),
    status: String(raw.status ?? 'unpaid'),
    currency: String(raw.currency ?? 'IDR'),
    documentSource: (raw.documentSource ?? raw.document_source ?? null) as string | null,
  }
}

export function normalizeBankAccountOption(raw: Record<string, unknown>): BankAccountOption {
  return {
    id: String(raw.id ?? ''),
    bankName: String(raw.bankName ?? raw.bank_name ?? ''),
    accountNumber: String(raw.accountNumber ?? raw.account_number ?? ''),
    accountName: String(raw.accountName ?? raw.account_name ?? ''),
    currency: String(raw.currency ?? 'IDR'),
  }
}

export function normalizeArReceiptFormOptions(raw: unknown): ArReceiptFormOptionsPayload {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const payload = (body.data && typeof body.data === 'object' ? body.data : body) as Record<
    string,
    unknown
  >

  const invoiceRows = Array.isArray(payload.invoices) ? payload.invoices : []
  const bankRows = Array.isArray(payload.bankAccounts)
    ? payload.bankAccounts
    : Array.isArray(payload.bank_accounts)
      ? payload.bank_accounts
      : []

  return {
    invoices: invoiceRows.map((row) =>
      normalizeArReceiptInvoiceOption(row as Record<string, unknown>)
    ),
    bankAccounts: bankRows.map((row) =>
      normalizeBankAccountOption(row as Record<string, unknown>)
    ),
  }
}

export function formatArInvoiceOptionLabel(
  invoice: ArReceiptInvoiceOption,
  formatMoney?: (amount: number, currency?: string) => string
): string {
  const fmt =
    formatMoney ??
    ((amount, currency = 'IDR') =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(amount))
  const outstanding = invoice.remainingAmount > 0 ? invoice.remainingAmount : invoice.total
  const label = invoice.noInvoice || invoice.id
  return `${label} — sisa ${fmt(outstanding, invoice.currency)}`
}

export function formatBankAccountOptionLabel(account: BankAccountOption): string {
  const bank = account.bankName || 'Bank'
  const number = account.accountNumber || '-'
  const name = account.accountName ? ` (${account.accountName})` : ''
  return `${bank} — ${number}${name}`
}
