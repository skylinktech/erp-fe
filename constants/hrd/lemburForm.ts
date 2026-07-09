/**
 * Shared options & display helpers untuk modul Lembur (SPKL).
 * Selaras dengan `src/app/models/lembur.ts` di backend.
 */

export const STATUS_LEMBUR_PENDING = 0
export const STATUS_LEMBUR_APPROVED = 1
export const STATUS_LEMBUR_REJECTED = 2
export const STATUS_LEMBUR_CANCELLED = 3
export const STATUS_LEMBUR_MENUNGGU = 10
export const STATUS_LEMBUR_DRAFT = 11

export const MAX_LEMBUR_JAM_HARI = 4
export const MAX_LEMBUR_JAM_MINGGU = 18
export const MAX_BACKDATE_LEMBUR_DAYS = 7

export const TIPE_HARI_KERJA = 'hari_kerja'
export const TIPE_HARI_LIBUR = 'hari_libur'

export const TIPE_HARI_OPTIONS = [
  { value: TIPE_HARI_KERJA, label: 'Hari Kerja' },
  { value: TIPE_HARI_LIBUR, label: 'Hari Libur / Libur Nasional' },
] as const

export const STATUS_LEMBUR_OPTIONS = [
  { label: 'Draft', value: STATUS_LEMBUR_DRAFT },
  { label: 'Menunggu Persetujuan', value: STATUS_LEMBUR_MENUNGGU },
  { label: 'Disetujui', value: STATUS_LEMBUR_APPROVED },
  { label: 'Ditolak', value: STATUS_LEMBUR_REJECTED },
  { label: 'Dibatalkan', value: STATUS_LEMBUR_CANCELLED },
] as const

export type StatusLemburBadge = { text: string; class: string }

export function getStatusLemburBadge(status: number | null | undefined): StatusLemburBadge {
  switch (status) {
    case STATUS_LEMBUR_DRAFT:
      return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case STATUS_LEMBUR_MENUNGGU:
      return { text: 'Menunggu Persetujuan', class: 'badge rounded-pill bg-label-info' }
    case STATUS_LEMBUR_APPROVED:
      return { text: 'Disetujui', class: 'badge rounded-pill bg-label-success' }
    case STATUS_LEMBUR_REJECTED:
      return { text: 'Ditolak', class: 'badge rounded-pill bg-label-danger' }
    case STATUS_LEMBUR_CANCELLED:
      return { text: 'Dibatalkan', class: 'badge rounded-pill bg-label-warning text-dark' }
    default:
      return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

export function getTipeHariLabel(tipe: string | null | undefined): string {
  return TIPE_HARI_OPTIONS.find((o) => o.value === tipe)?.label ?? tipe ?? '-'
}

export function formatJamRange(jamMulai?: string | null, jamSelesai?: string | null): string {
  const a = jamMulai ? String(jamMulai).slice(0, 5) : '-'
  const b = jamSelesai ? String(jamSelesai).slice(0, 5) : '-'
  return `${a} – ${b}`
}

export function formatDurasiJam(jam: number | null | undefined): string {
  if (jam == null) return '-'
  return `${Number(jam).toFixed(2).replace(/\.?0+$/, '')} jam`
}

export function computeDurasiPreview(
  jamMulai: string | null | undefined,
  jamSelesai: string | null | undefined,
  istirahatMenit = 0
): number | null {
  if (!jamMulai || !jamSelesai) return null
  const toMin = (t: string) => {
    const [h, m] = t.slice(0, 5).split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }
  const start = toMin(jamMulai)
  const end = toMin(jamSelesai)
  if (end <= start) return null
  const net = Math.max(0, end - start - Math.max(0, istirahatMenit))
  return +(net / 60).toFixed(2)
}

export function canEditLembur(row: { status: number }): boolean {
  return row.status === STATUS_LEMBUR_DRAFT || row.status === STATUS_LEMBUR_REJECTED
}

export function canSubmitLembur(row: { status: number }): boolean {
  return (
    row.status === STATUS_LEMBUR_DRAFT ||
    row.status === STATUS_LEMBUR_PENDING ||
    row.status === STATUS_LEMBUR_REJECTED
  )
}

export function canDeleteLembur(row: { status: number }): boolean {
  return (
    row.status === STATUS_LEMBUR_DRAFT ||
    row.status === STATUS_LEMBUR_REJECTED ||
    row.status === STATUS_LEMBUR_CANCELLED
  )
}

export function canCancelPendingLembur(row: { status: number }): boolean {
  return row.status === STATUS_LEMBUR_MENUNGGU
}

export const STATUS_LEMBUR_APPROVED_EXPORT = STATUS_LEMBUR_APPROVED
