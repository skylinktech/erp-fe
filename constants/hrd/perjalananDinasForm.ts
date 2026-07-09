/**
 * Shared options & display helpers untuk modul Perjalanan Dinas (SPPD).
 * Selaras dengan `src/app/models/perjalanan_dinas.ts` di backend.
 */

export const STATUS_PD_PENDING = 0
export const STATUS_PD_APPROVED = 1
export const STATUS_PD_REJECTED = 2
export const STATUS_PD_CANCELLED = 3
export const STATUS_PD_MENUNGGU = 10
export const STATUS_PD_DRAFT = 11

export const JENIS_DALAM_KOTA = 'dalam_kota'
export const JENIS_LUAR_KOTA = 'luar_kota'
export const JENIS_LUAR_NEGERI = 'luar_negeri'

/** Referensi PMK 72/2019 — Gol. III/B (perusahaan swasta). */
export const UANG_HARIAN_DALAM_KOTA = 290_000
export const UANG_HARIAN_LUAR_KOTA = 430_000
export const MIN_LEAD_DAYS_LUAR_KOTA = 3

export const JENIS_PERJALANAN_OPTIONS = [
  { value: JENIS_DALAM_KOTA, label: 'Dalam Kota' },
  { value: JENIS_LUAR_KOTA, label: 'Luar Kota' },
  { value: JENIS_LUAR_NEGERI, label: 'Luar Negeri' },
] as const

export const KENDARAAN_OPTIONS = [
  { value: 'pesawat', label: 'Pesawat' },
  { value: 'kereta', label: 'Kereta Api' },
  { value: 'bus', label: 'Bus / Travel' },
  { value: 'kendaraan_dinas', label: 'Kendaraan Dinas' },
  { value: 'kendaraan_pribadi', label: 'Kendaraan Pribadi' },
  { value: 'kapal', label: 'Kapal / Ferry' },
  { value: 'lainnya', label: 'Lainnya' },
] as const

export const STATUS_PD_OPTIONS = [
  { label: 'Draft', value: STATUS_PD_DRAFT },
  { label: 'Menunggu Persetujuan', value: STATUS_PD_MENUNGGU },
  { label: 'Disetujui', value: STATUS_PD_APPROVED },
  { label: 'Ditolak', value: STATUS_PD_REJECTED },
  { label: 'Dibatalkan', value: STATUS_PD_CANCELLED },
] as const

export type StatusPdBadge = { text: string; class: string }

export function getStatusPdBadge(status: number | null | undefined): StatusPdBadge {
  switch (status) {
    case STATUS_PD_DRAFT:
      return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case STATUS_PD_MENUNGGU:
      return { text: 'Menunggu Persetujuan', class: 'badge rounded-pill bg-label-info' }
    case STATUS_PD_APPROVED:
      return { text: 'Disetujui', class: 'badge rounded-pill bg-label-success' }
    case STATUS_PD_REJECTED:
      return { text: 'Ditolak', class: 'badge rounded-pill bg-label-danger' }
    case STATUS_PD_CANCELLED:
      return { text: 'Dibatalkan', class: 'badge rounded-pill bg-label-warning text-dark' }
    default:
      return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

export function getJenisPerjalananLabel(jenis: string | null | undefined): string {
  return JENIS_PERJALANAN_OPTIONS.find((o) => o.value === jenis)?.label ?? jenis ?? '-'
}

export function getKendaraanLabel(kendaraan: string | null | undefined): string {
  return KENDARAAN_OPTIONS.find((o) => o.value === kendaraan)?.label ?? kendaraan ?? '-'
}

export function formatRupiah(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

/** Format angka untuk input biaya (contoh: Rp 1.234.567). */
export function formatRupiahInput(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const digits = String(value).replace(/[^0-9]/g, '')
  if (!digits) return ''

  const split = digits.split(',')
  const sisa = split[0].length % 3
  let rupiah = split[0].substring(0, sisa)
  const ribuan = split[0].substring(sisa).match(/\d{3}/gi)
  if (ribuan) {
    const separator = sisa ? '.' : ''
    rupiah += separator + ribuan.join('.')
  }
  return `Rp ${rupiah}`
}

export function parseRupiahInput(text: string): number {
  const digits = text.replace(/[^0-9]/g, '')
  return digits ? Number(digits) : 0
}

export function parseRupiahInputNullable(text: string): number | null {
  const digits = text.replace(/[^0-9]/g, '')
  return digits ? Number(digits) : null
}

export function defaultUangHarianSatuan(jenis: string): number {
  if (jenis === JENIS_DALAM_KOTA) return UANG_HARIAN_DALAM_KOTA
  if (jenis === JENIS_LUAR_KOTA) return UANG_HARIAN_LUAR_KOTA
  return 0
}

export function computeLamaHari(berangkat: string, kembali: string): number | null {
  if (!berangkat || !kembali) return null
  const a = new Date(berangkat.slice(0, 10))
  const b = new Date(kembali.slice(0, 10))
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
  const days = Math.floor((b.getTime() - a.getTime()) / 86400000) + 1
  return days >= 1 ? days : null
}

export function computeBiayaPreview(payload: {
  jenis_perjalanan: string
  tanggal_berangkat: string
  tanggal_kembali: string
  uang_harian_satuan?: number
  biaya_transport?: number
  biaya_akomodasi?: number
  biaya_representasi?: number
  biaya_lainnya?: number
}) {
  const lamaHari = computeLamaHari(payload.tanggal_berangkat, payload.tanggal_kembali)
  if (!lamaHari) return null

  const satuan =
    payload.uang_harian_satuan != null && payload.uang_harian_satuan > 0
      ? payload.uang_harian_satuan
      : defaultUangHarianSatuan(payload.jenis_perjalanan)

  const uangHarianTotal = satuan * lamaHari
  const transport = Number(payload.biaya_transport ?? 0)
  const akomodasi = Number(payload.biaya_akomodasi ?? 0)
  const representasi = Number(payload.biaya_representasi ?? 0)
  const lainnya = Number(payload.biaya_lainnya ?? 0)
  const total = uangHarianTotal + transport + akomodasi + representasi + lainnya

  return {
    lamaHari,
    uangHarianSatuan: satuan,
    uangHarianTotal,
    biayaTransport: transport,
    biayaAkomodasi: akomodasi,
    biayaRepresentasi: representasi,
    biayaLainnya: lainnya,
    totalBiaya: total,
  }
}

export function minTanggalBerangkat(jenis: string): string {
  const d = new Date()
  if (jenis === JENIS_LUAR_KOTA || jenis === JENIS_LUAR_NEGERI) {
    d.setDate(d.getDate() + MIN_LEAD_DAYS_LUAR_KOTA)
  }
  return d.toISOString().slice(0, 10)
}

export function canEditPerjalananDinas(row: { status: number }): boolean {
  return row.status === STATUS_PD_DRAFT || row.status === STATUS_PD_REJECTED
}

export function canSubmitPerjalananDinas(row: { status: number }): boolean {
  return (
    row.status === STATUS_PD_DRAFT ||
    row.status === STATUS_PD_PENDING ||
    row.status === STATUS_PD_REJECTED
  )
}

export function canDeletePerjalananDinas(row: { status: number }): boolean {
  return (
    row.status === STATUS_PD_DRAFT ||
    row.status === STATUS_PD_REJECTED ||
    row.status === STATUS_PD_CANCELLED
  )
}

export function canCancelPendingPerjalananDinas(row: { status: number }): boolean {
  return row.status === STATUS_PD_MENUNGGU
}

export const STATUS_PD_APPROVED_EXPORT = STATUS_PD_APPROVED
