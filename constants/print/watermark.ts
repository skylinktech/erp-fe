import {
  getPrintDocumentPreset,
  type PrintDocumentType,
} from '~/constants/print/documents'
import { normalizePrintStatus } from '~/constants/print/normalize-status'
import {
  DEFAULT_WATERMARK_POLICY,
  resolveWatermarkFromPolicy,
  type PrintDocumentStatus,
  type PrintWatermarkLabel,
  type PrintWatermarkPolicy,
} from '~/constants/print/status'

export type { PrintDocumentStatus, PrintWatermarkLabel, PrintWatermarkPolicy }

/**
 * Map raw document status → overlay label using:
 * document type → normalizer → preset policy.
 * Unknown statuses produce no watermark.
 */
export function resolvePrintWatermark(
  type: PrintDocumentType,
  rawStatus: unknown,
  policyOverride?: PrintWatermarkPolicy
): PrintWatermarkLabel | null {
  const normalized = normalizePrintStatus(type, rawStatus)
  const policy = {
    ...DEFAULT_WATERMARK_POLICY,
    ...getPrintDocumentPreset(type).watermarkPolicy,
    ...policyOverride,
  }
  return resolveWatermarkFromPolicy(normalized, policy)
}

export function isDraftDocumentStatus(
  type: PrintDocumentType,
  rawStatus: unknown
): boolean {
  return normalizePrintStatus(type, rawStatus) === 'DRAFT'
}
