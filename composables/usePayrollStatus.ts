import { PAYROLL_STATUS_BADGE, PAYROLL_RUN_TYPE_OPTIONS } from '~/constants/payroll'

export function usePayrollStatus() {
  const formatRupiah = useFormatRupiah()

  function statusBadge(status?: string | null) {
    if (!status) return { text: '—', class: 'badge rounded-pill bg-label-secondary' }
    return PAYROLL_STATUS_BADGE[status] || { text: status, class: 'badge rounded-pill bg-label-secondary' }
  }

  function runTypeLabel(type?: string | null) {
    return PAYROLL_RUN_TYPE_OPTIONS.find((o) => o.value === type)?.label || type || '—'
  }

  function money(value: unknown) {
    if (value === null || value === undefined || value === '') return '—'
    return formatRupiah(value as number | string)
  }

  function formatDate(value?: string | null) {
    if (!value) return '—'
    const raw = String(value)
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    return d.toLocaleDateString('id-ID')
  }

  function formatDateTime(value?: string | null) {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleString('id-ID')
  }

  function maskAccount(value?: string | null) {
    const raw = String(value || '').replace(/\s/g, '')
    if (!raw) return '—'
    if (raw.length <= 4) return `****${raw}`
    return `****${raw.slice(-4)}`
  }

  function employeeName(row: { employeeSnapshot?: { employee_name?: string } | null; employee_snapshot?: { employee_name?: string } } | null | undefined) {
    return row?.employeeSnapshot?.employee_name || row?.employee_snapshot?.employee_name || '—'
  }

  function runLabel(run: { runNumber?: number; id?: number } | null | undefined) {
    if (!run) return '—'
    return run.runNumber ? `#${run.runNumber}` : `#${run.id}`
  }

  return {
    statusBadge,
    runTypeLabel,
    money,
    formatDate,
    formatDateTime,
    maskAccount,
    employeeName,
    runLabel,
  }
}
