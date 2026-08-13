import {
  STATUS_CUTI_APPROVED,
  STATUS_CUTI_CANCELLED,
  STATUS_CUTI_DRAFT,
  STATUS_CUTI_MENUNGGU,
  STATUS_CUTI_PENDING,
  STATUS_CUTI_REJECTED,
} from '~/constants/hrd/cutiForm'
import {
  STATUS_LEMBUR_APPROVED,
  STATUS_LEMBUR_CANCELLED,
  STATUS_LEMBUR_DRAFT,
  STATUS_LEMBUR_MENUNGGU,
  STATUS_LEMBUR_PENDING,
  STATUS_LEMBUR_REJECTED,
} from '~/constants/hrd/lemburForm'
import {
  STATUS_PD_APPROVED,
  STATUS_PD_CANCELLED,
  STATUS_PD_DRAFT,
  STATUS_PD_MENUNGGU,
  STATUS_PD_PENDING,
  STATUS_PD_REJECTED,
} from '~/constants/hrd/perjalananDinasForm'
import type { PrintDocumentType } from '~/constants/print/documents'
import type { PrintDocumentStatus } from '~/constants/print/status'

const STRING_STATUS: Record<string, PrintDocumentStatus> = {
  draft: 'DRAFT',
  pending: 'PENDING',
  pending_approval: 'PENDING',
  submitted: 'PENDING',
  menunggu: 'PENDING',
  approved: 'APPROVED',
  posted: 'POSTED',
  final: 'FINAL',
  completed: 'COMPLETED',
  rejected: 'REJECTED',
  cancelled: 'CANCELLED',
  canceled: 'CANCELLED',
  void: 'VOID',
  expired: 'EXPIRED',
}

type NumericStatusMap = Record<number, PrintDocumentStatus>

const HRD_CUTI_STATUS: NumericStatusMap = {
  [STATUS_CUTI_DRAFT]: 'DRAFT',
  [STATUS_CUTI_MENUNGGU]: 'PENDING',
  [STATUS_CUTI_PENDING]: 'PENDING',
  [STATUS_CUTI_APPROVED]: 'APPROVED',
  [STATUS_CUTI_REJECTED]: 'REJECTED',
  [STATUS_CUTI_CANCELLED]: 'CANCELLED',
}

const HRD_LEMBUR_STATUS: NumericStatusMap = {
  [STATUS_LEMBUR_DRAFT]: 'DRAFT',
  [STATUS_LEMBUR_MENUNGGU]: 'PENDING',
  [STATUS_LEMBUR_PENDING]: 'PENDING',
  [STATUS_LEMBUR_APPROVED]: 'APPROVED',
  [STATUS_LEMBUR_REJECTED]: 'REJECTED',
  [STATUS_LEMBUR_CANCELLED]: 'CANCELLED',
}

const HRD_PD_STATUS: NumericStatusMap = {
  [STATUS_PD_DRAFT]: 'DRAFT',
  [STATUS_PD_MENUNGGU]: 'PENDING',
  [STATUS_PD_PENDING]: 'PENDING',
  [STATUS_PD_APPROVED]: 'APPROVED',
  [STATUS_PD_REJECTED]: 'REJECTED',
  [STATUS_PD_CANCELLED]: 'CANCELLED',
}

function numericMapFor(type: PrintDocumentType): NumericStatusMap | null {
  switch (type) {
    case 'CUTI':
      return HRD_CUTI_STATUS
    case 'LEMBUR':
      return HRD_LEMBUR_STATUS
    case 'PERJALANAN_DINAS':
      return HRD_PD_STATUS
    default:
      return null
  }
}

function fromNumber(
  type: PrintDocumentType,
  value: number
): PrintDocumentStatus | null {
  const map = numericMapFor(type)
  if (!map) return null
  return map[value] ?? null
}

/**
 * Convert a document's raw API/database status into a semantic print status.
 * Numeric codes are interpreted only for the owning document type.
 */
export function normalizePrintStatus(
  type: PrintDocumentType,
  raw: unknown
): PrintDocumentStatus | null {
  if (raw === null || raw === undefined || raw === '') return null

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return fromNumber(type, raw)
  }

  const text = String(raw).trim()
  if (!text) return null

  if (/^-?\d+$/.test(text)) {
    return fromNumber(type, Number(text))
  }

  return STRING_STATUS[text.toLowerCase()] ?? null
}
