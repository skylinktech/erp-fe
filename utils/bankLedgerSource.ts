const SOURCE_PATHS: Record<string, (id: string) => string> = {
  ar_receipt: (id) => `/finance/ar-receipts?highlight=${id}`,
  ap_payment: (id) => `/finance/ap-payments?highlight=${id}`,
  payroll_payment_item: (id) => `/hrd/payroll/payments?item=${id}`,
  employee_advance: (id) => `/finance/ap-payments?highlight=${id}`,
  employee_advance_return: (id) => `/finance/payment-request?highlight=${id}`,
  expense_payment: (id) => `/finance/expenses?highlight=${id}`,
  bank_transfer: () => `/finance/bank-account`,
  bank_adjustment: () => `/finance/journals`,
  manual_journal: () => `/finance/journals`,
}

const SOURCE_LABELS: Record<string, string> = {
  ar_receipt: 'AR Receipt',
  ap_payment: 'AP Payment',
  payroll_payment_item: 'Payroll Payment',
  employee_advance: 'Employee Advance',
  employee_advance_return: 'Advance Return',
  expense_payment: 'Expense Payment',
  bank_transfer: 'Bank Transfer',
  bank_adjustment: 'Bank Adjustment',
  manual_journal: 'Manual Journal',
}

export function bankLedgerSourcePath(referenceType?: string | null, referenceId?: string | null): string | null {
  if (!referenceType || !referenceId) return null
  const fn = SOURCE_PATHS[referenceType]
  return fn ? fn(String(referenceId)) : null
}

export function bankLedgerSourceLabel(referenceType?: string | null): string {
  if (!referenceType) return '—'
  return SOURCE_LABELS[referenceType] || referenceType
}
