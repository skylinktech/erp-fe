export type JournalSourceLink = {
  journal: string | null
  source: string | null
  label: string
}

const SOURCE_LABELS: Record<string, string> = {
  sales_invoice: 'Sales Invoice',
  ar_receipt: 'AR Receipt',
  withholding_evidence: 'Withholding Evidence',
  purchase_invoice: 'Purchase Invoice',
  ap_payment: 'AP Payment',
  expense: 'Expense',
  expense_payment: 'Expense Payment',
  fixed_asset: 'Fixed Asset',
  payroll_run: 'Payroll',
  payroll_payment_item: 'Payroll Payment',
  inventory_accounting: 'Inventory Accounting',
  inventory_movement: 'Inventory Movement',
  inventory_grni_clearing: 'GRNI Clearing',
  bank_adjustment: 'Bank Adjustment',
  bank_transfer: 'Bank Transfer',
  employee_advance: 'Employee Advance',
  journal: 'Manual Journal',
}

const SOURCE_PATHS: Record<string, (id: string) => string> = {
  sales_invoice: (id) => `/finance/invoices/detail/${id}`,
  ar_receipt: (id) => `/finance/ar-receipts?highlight=${id}`,
  purchase_invoice: (id) => `/purchasing/purchase-invoice/form/${id}`,
  ap_payment: (id) => `/finance/ap-payments?highlight=${id}`,
  expense: (id) => `/finance/expenses?highlight=${id}`,
  expense_payment: (id) => `/finance/expenses?highlight=${id}`,
  fixed_asset: (id) => `/finance/assets?highlight=${id}`,
  payroll_run: (id) => `/payroll/runs/${id}`,
  payroll_payment_item: (id) => `/hrd/payroll/payments?item=${id}`,
  inventory_accounting: () => `/finance/inventory-accounting-events`,
  inventory_movement: () => `/finance/inventory-accounting-events`,
  inventory_grni_clearing: () => `/finance/grni`,
  bank_adjustment: () => `/finance/journals`,
  bank_transfer: () => `/finance/bank-account`,
  employee_advance: (id) => `/finance/ap-payments?highlight=${id}`,
  journal: (id) => `/finance/journals/detail/${id}`,
}

export function journalSourceLabel(referenceType?: string | null): string {
  if (!referenceType) return '—'
  return SOURCE_LABELS[referenceType] || referenceType
}

export function journalSourcePath(
  referenceType?: string | null,
  referenceId?: string | null
): string | null {
  if (!referenceType || !referenceId) return null
  const fn = SOURCE_PATHS[referenceType]
  return fn ? fn(String(referenceId)) : null
}

export function journalDetailPath(journalId?: string | null): string | null {
  if (!journalId) return null
  return `/finance/journals/detail/${journalId}`
}

export function resolveJournalSourceLinks(params: {
  journalId?: string | null
  referenceType?: string | null
  referenceId?: string | null
}): JournalSourceLink {
  return {
    journal: journalDetailPath(params.journalId),
    source: journalSourcePath(params.referenceType, params.referenceId),
    label: journalSourceLabel(params.referenceType),
  }
}
