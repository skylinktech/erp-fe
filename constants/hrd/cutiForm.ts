/**
 * Shared options & display helpers untuk modul Cuti / Izin / Sakit.
 * Selaras dengan `src/app/models/cuti.ts` di backend.
 */

export const STATUS_CUTI_PENDING = 0
export const STATUS_CUTI_APPROVED = 1
export const STATUS_CUTI_REJECTED = 2
export const STATUS_CUTI_CANCELLED = 3
export const STATUS_CUTI_MENUNGGU = 10
export const STATUS_CUTI_DRAFT = 11

export const STATUS_CUTI_OPTIONS = [
  { label: 'Draft', value: STATUS_CUTI_DRAFT },
  { label: 'Menunggu Persetujuan', value: STATUS_CUTI_MENUNGGU },
  { label: 'Disetujui', value: STATUS_CUTI_APPROVED },
  { label: 'Ditolak', value: STATUS_CUTI_REJECTED },
  { label: 'Dibatalkan', value: STATUS_CUTI_CANCELLED },
  { label: 'Pending (legacy)', value: STATUS_CUTI_PENDING },
] as const

export type StatusCutiBadge = { text: string; class: string }

export function getStatusCutiBadge(status: number | null | undefined): StatusCutiBadge {
  switch (status) {
    case STATUS_CUTI_DRAFT:
      return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case STATUS_CUTI_MENUNGGU:
      return { text: 'Menunggu Persetujuan', class: 'badge rounded-pill bg-label-info' }
    case STATUS_CUTI_APPROVED:
      return { text: 'Disetujui', class: 'badge rounded-pill bg-label-success' }
    case STATUS_CUTI_REJECTED:
      return { text: 'Ditolak', class: 'badge rounded-pill bg-label-danger' }
    case STATUS_CUTI_CANCELLED:
      return { text: 'Dibatalkan', class: 'badge rounded-pill bg-label-warning text-dark' }
    case STATUS_CUTI_PENDING:
      return { text: 'Pending', class: 'badge rounded-pill bg-label-secondary' }
    default:
      return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

export interface CutiTypeOption {
  id: number
  nmTipeCuti: string
  kodeCuti: string | null
  deskripsi: string | null
  jatahCuti: number
  isPaid: boolean
  isActive: boolean
}

/** Kode tipe cuti yang punya perlakuan khusus di UI. */
export const KODE_CUTI_SAKIT = 'CS'
export const KODE_CUTI_IZIN = 'IZ'
export const KODE_CUTI_TAHUNAN = 'CT'

/** Cuti Sakit boleh backdated paling lama 7 hari. */
export const MAX_BACKDATE_SAKIT_DAYS = 7

/**
 * Lead time minimum (hari) untuk cuti yang harus direncanakan
 * — sinkron dengan rule di backend `CutiService`.
 * Cuti Sakit & Izin dikecualikan.
 */
export const MIN_LEAD_TIME_DAYS_CUTI = 7

export function isSakit(kode: string | null | undefined): boolean {
  return kode === KODE_CUTI_SAKIT
}
export function isIzin(kode: string | null | undefined): boolean {
  return kode === KODE_CUTI_IZIN
}

/**
 * Hitung tanggal `min` untuk input `<input type="date">` pengajuan cuti
 * sesuai tipe — dipakai oleh form agar user tidak bisa memilih tanggal invalid.
 *
 * Output ISO `yyyy-MM-dd` (zona lokal, bukan UTC, agar tidak bergeser).
 */
export function minTanggalMulaiByKode(kode: string | null | undefined, now: Date = new Date()): string {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  if (isSakit(kode)) {
    d.setDate(d.getDate() - MAX_BACKDATE_SAKIT_DAYS)
  } else if (!isIzin(kode)) {
    // Cuti Tahunan / lainnya: wajib lead time minimum.
    d.setDate(d.getDate() + MIN_LEAD_TIME_DAYS_CUTI)
  }
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Format durasi pengajuan: "2 hari" atau "3 jam (07:00 – 10:00)". */
export function formatDurasiCuti(row: {
  isPerJam?: boolean
  is_per_jam?: boolean
  lamaCuti?: number | null
  lama_cuti?: number | null
  durasiJam?: number | null
  durasi_jam?: number | null
  jamMulai?: string | null
  jam_mulai?: string | null
  jamSelesai?: string | null
  jam_selesai?: string | null
}): string {
  const perJam = row.isPerJam ?? row.is_per_jam ?? false
  if (perJam) {
    const jam = row.durasiJam ?? row.durasi_jam ?? 0
    const mulai = (row.jamMulai ?? row.jam_mulai ?? '').slice(0, 5)
    const selesai = (row.jamSelesai ?? row.jam_selesai ?? '').slice(0, 5)
    const range = mulai && selesai ? ` (${mulai} – ${selesai})` : ''
    return `${jam} jam${range}`
  }
  const hari = row.lamaCuti ?? row.lama_cuti ?? 0
  return `${hari} hari`
}

/** Tampilan rentang tanggal "12 Mei 2026" atau "12 Mei – 15 Mei 2026". */
export function formatRangeTanggal(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined
): string {
  if (!start || !end) return '-'
  const fmt = (d: string | Date) => {
    const dt = typeof d === 'string' ? new Date(d) : d
    if (Number.isNaN(dt.getTime())) return '-'
    return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  }
  const a = fmt(start)
  const b = fmt(end)
  if (a === b) return a
  return `${a} – ${b}`
}

/** Apakah row cuti masih bisa di-edit (draft/ditolak). */
export function canEditCuti(row: { status?: number | null }): boolean {
  return row.status === STATUS_CUTI_DRAFT || row.status === STATUS_CUTI_REJECTED
}

/** Apakah row cuti boleh di-submit ke approval. */
export function canSubmitCuti(row: { status?: number | null }): boolean {
  return (
    row.status === STATUS_CUTI_DRAFT ||
    row.status === STATUS_CUTI_REJECTED ||
    row.status === STATUS_CUTI_PENDING
  )
}

/** Apakah row cuti boleh dibatalkan saat menunggu. */
export function canCancelPendingCuti(row: { status?: number | null }): boolean {
  return row.status === STATUS_CUTI_MENUNGGU
}

/** Apakah row cuti boleh dihapus. */
export function canDeleteCuti(row: { status?: number | null }): boolean {
  return (
    row.status === STATUS_CUTI_DRAFT ||
    row.status === STATUS_CUTI_REJECTED ||
    row.status === STATUS_CUTI_CANCELLED
  )
}
