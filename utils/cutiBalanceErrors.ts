import type { NormalizedApiError } from '~/utils/apiError'

/** Domain codes from leave-balance / cuti pengajuan (Phase 1C–1E). */
export const CUTI_BALANCE_DOMAIN_CODES = [
  'CUTI_BALANCE_NOT_CONFIGURED',
  'CUTI_BALANCE_INSUFFICIENT',
  'CUTI_BALANCE_AUTO_PRORATA_NOT_SUPPORTED',
  'CUTI_BALANCE_IDENTITY_IMMUTABLE',
  'CUTI_BALANCE_BELOW_CONSUMED_AMOUNT',
  'CUTI_BALANCE_DUPLICATE',
  'CUTI_BALANCE_MINIMUM_TENURE_NOT_MET',
  'CUTI_BALANCE_ANNUAL_LIMIT_EXCEEDED',
  'CUTI_BALANCE_ALLOCATION_EXCEEDED',
  'CUTI_BALANCE_STATUS_INELIGIBLE',
  'CUTI_BALANCE_TYPE_NOT_PROVISIONABLE',
  'CUTI_BALANCE_HISTORICAL_CB_EXCEEDS_QUOTA',
  'CUTI_BALANCE_SISA_REQUIRED',
  'CUTI_BALANCE_PERIOD_BEFORE_ELIGIBILITY',
] as const

export type CutiBalanceDomainCode = (typeof CUTI_BALANCE_DOMAIN_CODES)[number]

export function isCutiBalanceDomainCode(code: string | null | undefined): boolean {
  if (!code) return false
  return (CUTI_BALANCE_DOMAIN_CODES as readonly string[]).includes(code)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/** Append structured breakdown (floor / available-required) to user-facing message. */
export function enrichCutiBalanceErrorMessage(err: NormalizedApiError): string {
  const code = (err.code || '').toUpperCase()
  const raw = err.raw
  const body = isRecord(raw)
    ? isRecord(raw.data)
      ? (isRecord((raw.data as any).data) ? (raw.data as any).data : raw.data)
      : isRecord((raw as any).meta)
        ? raw
        : raw
    : {}

  const meta = isRecord(body) && isRecord(body.meta) ? body.meta : isRecord((raw as any)?.meta) ? (raw as any).meta : {}
  const data =
    (isRecord(body) && isRecord(body.data) ? body.data : null) ||
    (isRecord(meta) ? meta : null) ||
    {}

  const parts: string[] = [err.message]

  if (code === 'CUTI_BALANCE_BELOW_CONSUMED_AMOUNT') {
    const min = data.minimum_cuti_terpakai ?? meta.minimum_cuti_terpakai
    const approved = data.approved_leave_days ?? meta.approved_leave_days
    const bersama = data.cuti_bersama_days ?? meta.cuti_bersama_days
    if (min != null) {
      parts.push(
        `Minimum cuti terpakai: ${min} (pengajuan disetujui ${approved ?? 0} + cuti bersama ${bersama ?? 0}).`
      )
    }
  }

  if (code === 'CUTI_BALANCE_INSUFFICIENT') {
    const available = data.available ?? meta.available
    const required = data.required ?? meta.required
    if (available != null && required != null) {
      parts.push(`Tersedia ${available}, dibutuhkan ${required}.`)
    }
  }

  if (code === 'CUTI_BALANCE_DUPLICATE') {
    const tahun = data.tahun ?? meta.tahun
    // Prefer explicit domain copy for Saldo Cuti modal / toast.
    if (tahun != null) {
      return `Tipe cuti pegawai di tahun ${tahun} sudah ada.`
    }
    if (!/tahun\s+\d{4}\s+sudah ada/i.test(err.message)) {
      return 'Tipe cuti pegawai di tahun tersebut sudah ada.'
    }
  }

  if (code === 'CUTI_BALANCE_MINIMUM_TENURE_NOT_MET') {
    const eligibleAt = data.eligible_at ?? meta.eligible_at
    if (eligibleAt) parts.push(`Eligible mulai ${eligibleAt}.`)
  }

  return parts.filter(Boolean).join(' ')
}
