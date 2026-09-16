/**
 * Mirror UX of backend `#domain/hrd/cuti_type_balance_policy`.
 * Backend remains source of truth for enforcement; FE uses this for
 * provisioning type filters, max hints, and required/optional/none UX.
 */

export const KODE_CUTI_TAHUNAN = 'CT'
export const KODE_CUTI_SAKIT = 'CS'
export const KODE_CUTI_MELAHIRKAN = 'CM'
export const KODE_CUTI_BESAR = 'CB'
export const KODE_CUTI_TIDAK_DIBAYAR = 'CTB'
export const KODE_CUTI_IZIN = 'IZ'

export type CutiBalanceConsumption = 'required' | 'optional' | 'none'

export type CutiTypeBalancePolicy = {
  kodeCuti: string
  consumption: CutiBalanceConsumption
  annualQuotaLimit: number | null
  requiresMinimumTenure: boolean
}

const POLICY_BY_KODE: Record<string, CutiTypeBalancePolicy> = {
  [KODE_CUTI_TAHUNAN]: {
    kodeCuti: KODE_CUTI_TAHUNAN,
    consumption: 'required',
    annualQuotaLimit: 12,
    requiresMinimumTenure: true,
  },
  [KODE_CUTI_IZIN]: {
    kodeCuti: KODE_CUTI_IZIN,
    consumption: 'required',
    annualQuotaLimit: 2,
    requiresMinimumTenure: false,
  },
  [KODE_CUTI_BESAR]: {
    kodeCuti: KODE_CUTI_BESAR,
    consumption: 'required',
    annualQuotaLimit: null,
    requiresMinimumTenure: false,
  },
  [KODE_CUTI_SAKIT]: {
    kodeCuti: KODE_CUTI_SAKIT,
    consumption: 'optional',
    annualQuotaLimit: null,
    requiresMinimumTenure: false,
  },
  [KODE_CUTI_MELAHIRKAN]: {
    kodeCuti: KODE_CUTI_MELAHIRKAN,
    consumption: 'none',
    annualQuotaLimit: null,
    requiresMinimumTenure: false,
  },
  [KODE_CUTI_TIDAK_DIBAYAR]: {
    kodeCuti: KODE_CUTI_TIDAK_DIBAYAR,
    consumption: 'none',
    annualQuotaLimit: null,
    requiresMinimumTenure: false,
  },
}

export function normalizeKodeCuti(kode: string | null | undefined): string | null {
  if (kode == null) return null
  const k = String(kode).trim().toUpperCase()
  return k.length ? k : null
}

export function resolveCutiTypeBalancePolicy(
  kode: string | null | undefined
): CutiTypeBalancePolicy {
  const n = normalizeKodeCuti(kode)
  if (n && POLICY_BY_KODE[n]) return POLICY_BY_KODE[n]
  return {
    kodeCuti: n ?? '',
    consumption: 'optional',
    annualQuotaLimit: null,
    requiresMinimumTenure: false,
  }
}

export function allowsManualBalanceProvision(kode: string | null | undefined): boolean {
  return resolveCutiTypeBalancePolicy(kode).consumption !== 'none'
}

export function requiresBalance(kode: string | null | undefined): boolean {
  return resolveCutiTypeBalancePolicy(kode).consumption === 'required'
}

export function annualQuotaLimit(kode: string | null | undefined): number | null {
  return resolveCutiTypeBalancePolicy(kode).annualQuotaLimit
}

export const MANUAL_SALDO_COPY =
  'Saldo cuti diberikan secara manual oleh HR kepada pegawai yang memenuhi syarat.'
