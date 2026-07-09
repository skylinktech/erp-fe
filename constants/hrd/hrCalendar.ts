/** Shared constants & helpers for HR Kalender (libur nasional & event). */

export const HR_CALENDAR_TIPE_LIBUR_NASIONAL = 'libur_nasional' as const
export const HR_CALENDAR_TIPE_EVENT = 'event' as const
export const HR_CALENDAR_TIPE_CUTI_BERSAMA = 'cuti_bersama' as const

export type HrCalendarTipe =
  | typeof HR_CALENDAR_TIPE_LIBUR_NASIONAL
  | typeof HR_CALENDAR_TIPE_EVENT
  | typeof HR_CALENDAR_TIPE_CUTI_BERSAMA

export const HR_CALENDAR_TIPE_OPTIONS = [
  { label: 'Libur Nasional', value: HR_CALENDAR_TIPE_LIBUR_NASIONAL },
  { label: 'Event Perusahaan', value: HR_CALENDAR_TIPE_EVENT },
  { label: 'Cuti Bersama', value: HR_CALENDAR_TIPE_CUTI_BERSAMA },
] as const

export const HR_CALENDAR_DEFAULT_COLORS: Record<HrCalendarTipe, string> = {
  [HR_CALENDAR_TIPE_LIBUR_NASIONAL]: '#dc3545',
  [HR_CALENDAR_TIPE_EVENT]: '#696cff',
  [HR_CALENDAR_TIPE_CUTI_BERSAMA]: '#ff9f43',
}

export interface HrCalendarEventRow {
  id: number
  nama: string
  tanggal_mulai: string
  tanggal_selesai: string
  tipe: HrCalendarTipe
  deskripsi: string | null
  warna: string | null
}

export interface HrCalendarFullCalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  backgroundColor: string
  borderColor: string
  extendedProps: {
    rawId: number
    tipe: HrCalendarTipe
    deskripsi: string | null
    tanggal_mulai: string
    tanggal_selesai: string
    warna: string | null
  }
}

export function getHrCalendarTipeLabel(tipe: HrCalendarTipe | null | undefined): string {
  const opt = HR_CALENDAR_TIPE_OPTIONS.find((o) => o.value === tipe)
  return opt?.label ?? '-'
}

export function getHrCalendarColor(
  tipe: HrCalendarTipe,
  warna?: string | null
): string {
  const trimmed = warna?.trim()
  if (trimmed) return trimmed
  return HR_CALENDAR_DEFAULT_COLORS[tipe] ?? HR_CALENDAR_DEFAULT_COLORS[HR_CALENDAR_TIPE_EVENT]
}

/** Format rentang tanggal inklusif untuk display. */
export function formatHrCalendarRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start) return '-'
  const fmt = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const a = fmt(start)
  const b = end && end !== start ? fmt(end) : null
  return b ? `${a} – ${b}` : a
}

/** Hitung jumlah hari inklusif antara dua tanggal ISO (yyyy-mm-dd). */
export function computeHrCalendarInclusiveDays(
  start: string | null | undefined,
  end: string | null | undefined
): number {
  if (!start) return 0
  const endDate = end || start
  const a = new Date(start)
  const b = new Date(endDate)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0
  const diff = Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diff)
}

export function createEmptyHrCalendarForm() {
  return {
    id: null as number | null,
    nama: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    tipe: HR_CALENDAR_TIPE_LIBUR_NASIONAL as HrCalendarTipe,
    deskripsi: '',
    warna: '',
  }
}
