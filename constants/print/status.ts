/**
 * Semantic print statuses. Presentation-only — not database values.
 */
export const PRINT_DOCUMENT_STATUSES = [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'POSTED',
  'FINAL',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
  'VOID',
  'EXPIRED',
] as const

export type PrintDocumentStatus = (typeof PRINT_DOCUMENT_STATUSES)[number]

/** Overlay text actually rendered. Subset of statuses that have a visual mark. */
export const PRINT_WATERMARK_LABELS = [
  'DRAFT',
  'PENDING',
  'REJECTED',
  'CANCELLED',
  'VOID',
] as const

export type PrintWatermarkLabel = (typeof PRINT_WATERMARK_LABELS)[number]

export type PrintWatermarkPolicy = Partial<
  Record<PrintDocumentStatus, PrintWatermarkLabel | null>
>

/**
 * Default visual policy.
 * PENDING is explicit null: not treated as FINAL, but most documents are
 * printed during approval without an overlay (see per-document overrides).
 */
export const DEFAULT_WATERMARK_POLICY: PrintWatermarkPolicy = {
  DRAFT: 'DRAFT',
  PENDING: null,
  APPROVED: null,
  POSTED: null,
  FINAL: null,
  COMPLETED: null,
  EXPIRED: null,
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  VOID: 'VOID',
}

export function resolveWatermarkFromPolicy(
  status: PrintDocumentStatus | null,
  policy: PrintWatermarkPolicy = DEFAULT_WATERMARK_POLICY
): PrintWatermarkLabel | null {
  if (!status) return null
  if (Object.prototype.hasOwnProperty.call(policy, status)) {
    return policy[status] ?? null
  }
  return DEFAULT_WATERMARK_POLICY[status] ?? null
}
