/**
 * Budget history source document link/label helpers.
 *
 * Separate from journalSourceRoutes.ts on purpose: journal drill-down for
 * `purchase_invoice` points at the PI *form* page, while budget history should
 * point at the read-only PI *detail* page — same reference_type, different target.
 */
export type BudgetSourceType = 'purchase_order' | 'purchase_invoice' | 'purchase_request' | string

export type BudgetSourceDocument = {
  type: BudgetSourceType | null
  number: string | null
  link: string | null
}

const BUDGET_SOURCE_LABELS: Record<string, string> = {
  purchase_order: 'Purchase Order',
  purchase_invoice: 'Purchase Invoice',
  purchase_request: 'Purchase Request',
}

const BUDGET_SOURCE_PATHS: Record<string, (id: string) => string> = {
  purchase_order: (id) => `/purchasing/purchase-order-detail?id=${id}`,
  purchase_invoice: (id) => `/purchasing/purchase-invoice-detail?id=${id}`,
  purchase_request: (id) => `/purchasing/purchase-request/detail/${id}`,
}

export function budgetSourceLabel(referenceType?: string | null): string {
  if (!referenceType) return 'Manual / lainnya'
  return BUDGET_SOURCE_LABELS[referenceType] || referenceType
}

export function budgetSourcePath(
  referenceType?: string | null,
  referenceId?: string | null
): string | null {
  if (!referenceType || !referenceId) return null
  const fn = BUDGET_SOURCE_PATHS[referenceType]
  return fn ? fn(String(referenceId)) : null
}

/**
 * Display helper for a budget history row's `sourceDocument`.
 * Never falls back to a raw UUID as the "document number" — shows a dash instead
 * when the backend could not resolve a human-readable number (e.g. noPo/noInvoice).
 */
export function budgetSourceDisplay(source?: BudgetSourceDocument | null): {
  label: string
  number: string
  link: string | null
} {
  if (!source || !source.type) {
    return { label: 'Manual / lainnya', number: '—', link: null }
  }
  return {
    label: budgetSourceLabel(source.type),
    number: source.number || '—',
    link: source.link ?? budgetSourcePath(source.type, null),
  }
}
