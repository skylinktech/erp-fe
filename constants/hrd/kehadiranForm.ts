export const ATTENDANCE_STATE_OPTIONS = [
  { value: 'PRESENT', label: 'Hadir' },
  { value: 'ABSENT', label: 'Absen' },
  { value: 'LEAVE', label: 'Cuti' },
  { value: 'HOLIDAY', label: 'Libur Nasional' },
  { value: 'COLLECTIVE_LEAVE', label: 'Cuti Bersama' },
  { value: 'REST_DAY', label: 'Hari Libur' },
  { value: 'INCOMPLETE', label: 'Tidak Lengkap' },
] as const

export const PERIOD_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Terbuka' },
  { value: 'CALCULATING', label: 'Menghitung' },
  { value: 'CALCULATED', label: 'Terhitung' },
  { value: 'FINALIZED', label: 'Final' },
] as const

export function getAttendanceStateBadge(state: string | null | undefined) {
  switch (state) {
    case 'PRESENT':
      return { text: 'Hadir', class: 'badge rounded-pill bg-label-success' }
    case 'ABSENT':
      return { text: 'Absen', class: 'badge rounded-pill bg-label-danger' }
    case 'LEAVE':
      return { text: 'Cuti', class: 'badge rounded-pill bg-label-info' }
    case 'HOLIDAY':
      return { text: 'Libur', class: 'badge rounded-pill bg-label-secondary' }
    case 'COLLECTIVE_LEAVE':
      return { text: 'Cuti Bersama', class: 'badge rounded-pill bg-label-warning text-dark' }
    case 'REST_DAY':
      return { text: 'Off', class: 'badge rounded-pill bg-label-dark' }
    case 'INCOMPLETE':
      return { text: 'Tidak Lengkap', class: 'badge rounded-pill bg-label-warning text-dark' }
    default:
      return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

export function getPeriodStatusBadge(status: string | null | undefined) {
  switch (status) {
    case 'OPEN':
      return { text: 'Terbuka', class: 'badge rounded-pill bg-label-primary' }
    case 'CALCULATING':
      return { text: 'Menghitung', class: 'badge rounded-pill bg-label-warning text-dark' }
    case 'CALCULATED':
      return { text: 'Terhitung', class: 'badge rounded-pill bg-label-info' }
    case 'FINALIZED':
      return { text: 'Final', class: 'badge rounded-pill bg-label-success' }
    default:
      return { text: status || '-', class: 'badge rounded-pill bg-label-secondary' }
  }
}

export function formatMinutesAsHours(minutes: number | null | undefined): string {
  const m = Number(minutes || 0)
  if (!m) return '0 jam'
  const h = Math.floor(m / 60)
  const rest = m % 60
  if (!h) return `${rest} mnt`
  if (!rest) return `${h} jam`
  return `${h} jam ${rest} mnt`
}

export const ISO_WEEKDAYS = [
  { day_of_week: 1, label: 'Senin' },
  { day_of_week: 2, label: 'Selasa' },
  { day_of_week: 3, label: 'Rabu' },
  { day_of_week: 4, label: 'Kamis' },
  { day_of_week: 5, label: 'Jumat' },
  { day_of_week: 6, label: 'Sabtu' },
  { day_of_week: 7, label: 'Minggu' },
] as const

export type WorkScheduleDayForm = {
  day_of_week: number
  is_working_day: boolean
  start_time: string
  end_time: string
  break_minutes: number
}

export type ScheduleAssignmentRow = {
  pegawai_id: number | null
  effective_from: string
  effective_to: string
}

export function defaultWorkScheduleDays(): WorkScheduleDayForm[] {
  return ISO_WEEKDAYS.map((d) => {
    const working = d.day_of_week <= 5
    return {
      day_of_week: d.day_of_week,
      is_working_day: working,
      start_time: working ? '08:00' : '',
      end_time: working ? '17:00' : '',
      break_minutes: working ? 60 : 0,
    }
  })
}

export function emptyScheduleAssignmentRow(): ScheduleAssignmentRow {
  return { pegawai_id: null, effective_from: '', effective_to: '' }
}
