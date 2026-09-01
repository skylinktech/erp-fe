import type { DismantleAttachmentItem, DismantleAttachmentRequirementSummary } from '~/types/operations/dismantle'

export const DISMANTLE_ATTACHMENT_TYPE_OPTIONS = [
  { value: 'CUSTOMER_REQUEST', label: 'Permintaan Customer' },
  { value: 'TERMINATION_LETTER', label: 'Surat Terminasi' },
  { value: 'WORK_ORDER', label: 'Work Order' },
  { value: 'SITE_PERMIT', label: 'Izin Site' },
  { value: 'PHOTO_BEFORE', label: 'Foto Sebelum' },
  { value: 'PHOTO_AFTER', label: 'Foto Sesudah' },
  { value: 'CUSTOMER_HANDOVER', label: 'Serah Terima Customer' },
  { value: 'WAREHOUSE_RECEIPT', label: 'Bukti Warehouse' },
  { value: 'INSPECTION_DOCUMENT', label: 'Dokumen Inspeksi' },
  { value: 'OTHER', label: 'Lainnya' },
] as const

export function dismantleAttachmentTypeLabel(type: string): string {
  return DISMANTLE_ATTACHMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
}

export const DISMANTLE_ATTACHMENT_ERROR_LABELS: Record<string, string> = {
  DISMANTLE_ATTACHMENT_NOT_FOUND: 'Attachment tidak ditemukan',
  DISMANTLE_ATTACHMENT_FORBIDDEN: 'Anda tidak memiliki izin untuk aksi ini',
  DISMANTLE_ATTACHMENT_COMPANY_SCOPE_MISMATCH: 'Attachment berada di luar scope perusahaan Anda',
  DISMANTLE_ATTACHMENT_TYPE_INVALID: 'Tipe attachment tidak valid',
  DISMANTLE_ATTACHMENT_FILE_REQUIRED: 'File wajib dipilih',
  DISMANTLE_ATTACHMENT_FILE_TOO_LARGE: 'Ukuran file melebihi batas yang diizinkan',
  DISMANTLE_ATTACHMENT_MIME_INVALID: 'Tipe file tidak diizinkan (hanya PDF, JPG, PNG)',
  DISMANTLE_ATTACHMENT_EXTENSION_MISMATCH: 'Ekstensi file tidak sesuai isi file',
  DISMANTLE_ATTACHMENT_LINE_MISMATCH: 'Equipment/service line tidak valid untuk request ini',
  DISMANTLE_ATTACHMENT_DUPLICATE: 'Attachment duplikat',
  DISMANTLE_ATTACHMENT_IMMUTABLE: 'Attachment tidak dapat diubah pada status ini',
  DISMANTLE_ATTACHMENT_VOID_REASON_REQUIRED: 'Alasan void wajib diisi',
  DISMANTLE_ATTACHMENT_STORAGE_ERROR: 'Gagal memproses penyimpanan file',
  DISMANTLE_ATTACHMENT_IN_USE: 'Attachment tidak dapat digunakan (void atau tidak aktif)',
  DISMANTLE_ATTACHMENT_IDEMPOTENCY_CONFLICT: 'Konflik idempotency — file berbeda dengan key yang sama',
  DISMANTLE_ATTACHMENT_HANDOVER_EVIDENCE_REQUIRED: 'Bukti CUSTOMER_HANDOVER wajib untuk handover',
}

export function dismantleAttachmentErrorLabel(code?: string, fallback?: string): string {
  if (!code) return fallback ?? 'Gagal memproses attachment'
  return DISMANTLE_ATTACHMENT_ERROR_LABELS[code] ?? fallback ?? code
}

export const DEFAULT_ATTACHMENT_MAX_MB = 10
export const DEFAULT_ATTACHMENT_ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png']

export function validateAttachmentFileClient(file: File, maxMb = DEFAULT_ATTACHMENT_MAX_MB): string | null {
  const maxBytes = maxMb * 1024 * 1024
  if (file.size > maxBytes) return `Ukuran file maksimal ${maxMb} MB`
  const allowed = DEFAULT_ATTACHMENT_ALLOWED_MIME
  if (!allowed.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    const byExt = ext === 'pdf' || ext === 'jpg' || ext === 'jpeg' || ext === 'png'
    if (!byExt) return 'Hanya PDF, JPG, dan PNG yang diizinkan'
  }
  return null
}

export function formatAttachmentSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatAttachmentTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function isPhotoAttachmentType(type: string): boolean {
  return type === 'PHOTO_BEFORE' || type === 'PHOTO_AFTER'
}
