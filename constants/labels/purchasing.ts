/** Label UI standar modul purchasing (pengganti istilah lama "IRO"). */
export const LABEL_PURCHASE_ORDER = 'Purchase Order' as const

/** Opsi dropdown / tabel yang terhubung ke purchase request / order legacy. */
export function formatPurchaseOrderOptionLabel(
  row: {
    id?: number
    prNumber?: string
    pr_number?: string
    noPurchaseRequest?: string
    noPo?: string
    no_po?: string
  } | null | undefined
): string {
  if (!row) return ''
  const no =
    row.noPo ??
    row.no_po ??
    row.prNumber ??
    row.pr_number ??
    row.noPurchaseRequest
  if (no) return String(no)
  return row.id != null ? `PO-${row.id}` : ''
}
