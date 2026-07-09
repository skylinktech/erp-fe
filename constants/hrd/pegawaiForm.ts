/** Shared options & display helpers for Pegawai list + form (single source of truth). */

export const PENDIDIKAN_PEGAWAI_OPTIONS = [
  { label: 'SD', value: 0 },
  { label: 'SMP', value: 1 },
  { label: 'SMA', value: 2 },
  { label: 'D3', value: 6 },
  { label: 'D4', value: 7 },
  { label: 'S1', value: 3 },
  { label: 'S2', value: 4 },
  { label: 'S3', value: 5 },
] as const

export const JENIS_KELAMIN_PEGAWAI_OPTIONS = [
  { label: 'Perempuan', value: 0 },
  { label: 'Laki-Laki', value: 1 },
] as const

/** Jenis kontrak (selaras `status_pegawai` PKWTT/PKWT). */
export const JENIS_KONTRAK_PEGAWAI_OPTIONS = [
  { label: 'PKWTT', value: 1 },
  { label: 'PKWT', value: 2 },
] as const

export const STATUS_KONTRAK_PEGAWAI_OPTIONS = [
  { label: 'Draft', value: 1 },
  { label: 'Aktif', value: 2 },
  { label: 'Berakhir', value: 3 },
  { label: 'Dibatalkan', value: 4 },
  { label: 'Menunggu persetujuan', value: 5 },
  { label: 'Ditolak', value: 6 },
] as const

export const STATUS_PEGAWAI_OPTIONS = [
  { label: 'PKWTT', value: 1 },
  { label: 'PKWT', value: 2 },
  { label: 'Freelance', value: 3 },
  { label: 'Resign', value: 4 },
  { label: 'Tidak diketahui', value: 5 },
] as const

export const AGAMA_OPTIONS = [
  { label: 'Islam', value: 'Islam' },
  { label: 'Kristen', value: 'Kristen' },
  { label: 'Katolik', value: 'Katolik' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Buddha', value: 'Buddha' },
  { label: 'Konghucu', value: 'Konghucu' },
  { label: 'Lainnya', value: 'Lainnya' },
] as const

export type StatusPegawaiBadge = { text: string; class: string }

export function getStatusPegawaiBadge(status: number | null | undefined): StatusPegawaiBadge {
  switch (status) {
    case 1:
      return { text: 'PKWTT', class: 'badge rounded-pill bg-label-primary' }
    case 2:
      return { text: 'PKWT', class: 'badge rounded-pill bg-label-secondary' }
    case 3:
      return { text: 'Freelance', class: 'badge rounded-pill bg-label-warning text-dark' }
    case 4:
      return { text: 'Resign', class: 'badge rounded-pill bg-label-danger' }
    case 5:
      return { text: 'Tidak Diketahui', class: 'badge rounded-pill bg-label-dark' }
    default:
      return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

export type KontrakStatusBadge = { text: string; class: string }

export function getStatusKontrakPegawaiBadge(status: number | null | undefined): KontrakStatusBadge {
  switch (status) {
    case 1:
      return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 2:
      return { text: 'Aktif', class: 'badge rounded-pill bg-label-success' }
    case 3:
      return { text: 'Berakhir', class: 'badge rounded-pill bg-label-dark' }
    case 4:
      return { text: 'Dibatalkan', class: 'badge rounded-pill bg-label-warning text-dark' }
    case 5:
      return { text: 'Menunggu Persetujuan', class: 'badge rounded-pill bg-label-info' }
    case 6:
      return { text: 'Ditolak', class: 'badge rounded-pill bg-label-danger' }
    default:
      return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

export function getJenisKontrakPegawaiLabel(jenis: number | null | undefined): string {
  switch (jenis) {
    case 1:
      return 'PKWTT'
    case 2:
      return 'PKWT'
    default:
      return '-'
  }
}

/**
 * Ringkasan kontrak aktif pegawai untuk ditampilkan di tabel list.
 *
 * - Jika kontrak ada → label "{PKWTT|PKWT} - {Status}" dengan badge sesuai status kontrak.
 * - Jika belum ada record kontrak sama sekali (pegawai baru / belum diajukan approval) →
 *   tampilkan "PKWTT (Sedang ditinjau)" sebagai default trial period.
 */
export type KontrakAktifInfo = {
  jenis_kontrak?: number | null
  status?: number | null
} | null | undefined

export function getKontrakAktifDisplay(kontrak: KontrakAktifInfo): KontrakStatusBadge {
  if (!kontrak || kontrak.status == null || kontrak.jenis_kontrak == null) {
    return {
      text: 'PKWTT (Sedang ditinjau)',
      class: 'badge rounded-pill bg-label-info',
    }
  }
  const jenisLabel = getJenisKontrakPegawaiLabel(kontrak.jenis_kontrak)
  const statusBadge = getStatusKontrakPegawaiBadge(kontrak.status)
  return {
    text: `${jenisLabel} - ${statusBadge.text}`,
    class: statusBadge.class,
  }
}

export function getJenisKelaminLabel(value: number | null | undefined): string {
  switch (value) {
    case 0:
      return 'Perempuan'
    case 1:
      return 'Laki-Laki'
    default:
      return '-'
  }
}

export function getPendidikanLabel(value: number | null | undefined): string {
  const opt = PENDIDIKAN_PEGAWAI_OPTIONS.find((o) => o.value === value)
  return opt?.label ?? '-'
}

/** Format angka rupiah singkat untuk display profil (Rp 1.234.567). */
export function formatRupiahDisplay(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-'
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

/** Format tanggal ISO ke "DD Mmm YYYY" (locale id). Mengembalikan '-' jika invalid. */
export function formatTanggalDisplay(value: string | Date | null | undefined): string {
  if (!value) return '-'
  const d = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Format durasi masa kerja dari total bulan menjadi "X tahun Y bulan".
 * Jika kurang dari 1 bulan, mengembalikan "< 1 bulan".
 */
export function formatMasaKerja(totalBulan: number | null | undefined): string {
  if (totalBulan == null || !Number.isFinite(totalBulan)) return '-'
  if (totalBulan <= 0) return '< 1 bulan'
  const years = Math.floor(totalBulan / 12)
  const months = totalBulan % 12
  const parts: string[] = []
  if (years > 0) parts.push(`${years} tahun`)
  if (months > 0) parts.push(`${months} bulan`)
  return parts.join(' ') || '< 1 bulan'
}

/** HR module quick nav (aligned with `data/erp-menu.js` HRD entries). */
export const HRD_MODULE_NAV = [
  { label: 'Pegawai', to: '/hrd/pegawai', icon: 'ri-team-line' },
  { label: 'Kehadiran', to: '/hrd/kehadiran', icon: 'ri-calendar-check-line' },
  { label: 'Cuti & Izin', to: '/hrd/cuti', icon: 'ri-calendar-event-line' },
  { label: 'Kalender', to: '/hrd/kalender', icon: 'ri-calendar-line' },
  { label: 'Departemen', to: '/hrd/departemen', icon: 'ri-building-line' },
  { label: 'Jabatan', to: '/hrd/jabatan', icon: 'ri-user-settings-line' },
  { label: 'Divisi', to: '/hrd/divisi', icon: 'ri-group-3-line' },
] as const
