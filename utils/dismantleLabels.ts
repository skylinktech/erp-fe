import type { DismantleRequestStatus, DismantleSummaryPhase } from '~/types/operations/dismantle'

export interface StatusBadgeMeta {
  text: string
  class: string
}

const STATUS_MAP: Record<DismantleRequestStatus, StatusBadgeMeta> = {
  draft: { text: 'Draft', class: 'badge bg-label-secondary' },
  submitted: { text: 'Menunggu Approval', class: 'badge bg-label-warning' },
  approved: { text: 'Disetujui', class: 'badge bg-label-success' },
  rejected: { text: 'Ditolak', class: 'badge bg-label-danger' },
  scheduled: { text: 'Terjadwal', class: 'badge bg-label-info' },
  in_progress: { text: 'Berjalan', class: 'badge bg-label-primary' },
  blocked: { text: 'Terblokir', class: 'badge bg-label-danger' },
  cancelled: { text: 'Dibatalkan', class: 'badge bg-label-dark' },
  completed: { text: 'Selesai', class: 'badge bg-label-success' },
}

const PHASE_MAP: Record<DismantleSummaryPhase, StatusBadgeMeta> = {
  AWAITING_PHYSICAL: { text: 'Menunggu Physical Removal', class: 'badge bg-label-warning' },
  AWAITING_RECEIPT: { text: 'Menunggu Warehouse Receipt', class: 'badge bg-label-info' },
  AWAITING_TERMINATION: { text: 'Menunggu Terminasi Layanan', class: 'badge bg-label-warning' },
  AWAITING_BILLING: { text: 'Menunggu Billing/Finance', class: 'badge bg-label-warning' },
  READY_TO_COMPLETE: { text: 'Siap Complete', class: 'badge bg-label-success' },
  PARTIAL: { text: 'Progress Parsial', class: 'badge bg-label-primary' },
  BLOCKED: { text: 'Terblokir', class: 'badge bg-label-danger' },
}

const ERROR_LABELS: Record<string, string> = {
  FEATURE_DISABLED: 'Fitur Request Dismantle belum diaktifkan',
  STALE_DISMANTLE_VERSION: 'Data sudah berubah — muat ulang halaman',
  OWNERSHIP_UNKNOWN: 'Kepemilikan peralatan belum diketahui',
  OWNERSHIP_UNVERIFIED: 'Kepemilikan peralatan belum diverifikasi',
  CUSTODY_RECORD_MISSING: 'Catatan custody tidak ditemukan',
  VALUATION_SOURCE_ERROR: 'Sumber valuasi tidak valid',
  EQUIPMENT_SERIAL_MISMATCH: 'Serial tidak sesuai',
  EQUIPMENT_ALREADY_REMOVED: 'Peralatan sudah di-remove',
  CUSTOMER_OWNED_COMPANY_RECEIPT_FORBIDDEN: 'Peralatan milik customer tidak boleh diterima warehouse',
  SERVICE_TERMINATION_NOT_DUE: 'Terminasi layanan belum jatuh tempo',
  BILLING_CUTOFF_UNRESOLVED: 'Kebijakan billing cutoff belum terselesaikan',
  FINANCE_REVIEW_REQUIRED: 'Review Finance diperlukan',
  DISMANTLE_PRICE_AMBIGUOUS: 'Harga dismantle ambigu',
  DISMANTLE_COMPANY_SCOPE_MISMATCH: 'Scope perusahaan tidak sesuai',
  DISMANTLE_FINANCE_REVIEWER_NOT_ELIGIBLE: 'Reviewer Finance tidak eligible',
  RESERVED_CHARGE_CONFLICT: 'Charge sudah di-reserve',
  FINAL_CHARGE_ALREADY_INVOICED: 'Charge sudah di-invoice',
  DISMANTLE_COMPLETION_BLOCKED: 'Completion diblokir',
  DISMANTLE_REQUEST_NOT_EDITABLE: 'Request tidak dapat diedit pada status ini',
}

const BLOCKER_CATEGORIES: Record<string, string> = {
  OWNERSHIP_UNKNOWN: 'Ownership',
  OWNERSHIP_UNVERIFIED: 'Ownership',
  EQUIPMENT_OWNERSHIP_UNKNOWN: 'Ownership',
  EQUIPMENT_OWNERSHIP_UNVERIFIED: 'Ownership',
  BILLING_CUTOFF_UNRESOLVED: 'Billing',
  FINANCE_REVIEW_REQUIRED: 'Finance',
  EQUIPMENT_SERIAL_MISMATCH: 'Equipment',
  CUSTODY_RECORD_MISSING: 'Custody',
  CUSTOMER_OWNED_COMPANY_RECEIPT_FORBIDDEN: 'Warehouse',
  SERVICE_TERMINATION_NOT_DUE: 'Service',
  DISMANTLE_FINANCE_REVIEWER_NOT_ELIGIBLE: 'Permission',
  STALE_DISMANTLE_VERSION: 'Concurrency',
}

export function getDismantleStatusBadge(status: string | null | undefined): StatusBadgeMeta {
  if (!status) return { text: '—', class: 'badge bg-label-secondary' }
  return STATUS_MAP[status as DismantleRequestStatus] ?? { text: status, class: 'badge bg-label-secondary' }
}

export function getDismantlePhaseBadge(phase: string | null | undefined): StatusBadgeMeta {
  if (!phase) return { text: '—', class: 'badge bg-label-secondary' }
  return PHASE_MAP[phase as DismantleSummaryPhase] ?? { text: phase, class: 'badge bg-label-secondary' }
}

export function getDismantleErrorLabel(code: string | null | undefined, fallback?: string): string {
  if (!code) return fallback ?? 'Terjadi kesalahan'
  return ERROR_LABELS[code] ?? fallback ?? code
}

export function getBlockerCategory(code: string): string {
  return BLOCKER_CATEGORIES[code] ?? 'General'
}

export const TERMINATION_TYPE_OPTIONS = [
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Early Termination', value: 'EARLY_TERMINATION' },
  { label: 'Permintaan Customer', value: 'CUSTOMER_REQUEST' },
  { label: 'Internal', value: 'INTERNAL' },
  { label: 'Kontrak Berakhir', value: 'CONTRACT_EXPIRED' },
  { label: 'Lainnya', value: 'OTHER' },
] as const

export const BILLING_CUTOFF_OPTIONS = [
  { label: 'Tanggal Efektif', value: 'EFFECTIVE_DATE' },
  { label: 'Akhir Periode', value: 'END_OF_PERIOD' },
  { label: 'Periode Penuh', value: 'FULL_PERIOD' },
  { label: 'Review Manual', value: 'MANUAL_REVIEW' },
] as const

export const FOUND_STATUS_OPTIONS = [
  { label: 'Ditemukan', value: 'FOUND' },
  { label: 'Sebagian', value: 'PARTIAL' },
  { label: 'Tidak Ditemukan', value: 'NOT_FOUND' },
  { label: 'Tidak Berlaku', value: 'NOT_APPLICABLE' },
] as const
